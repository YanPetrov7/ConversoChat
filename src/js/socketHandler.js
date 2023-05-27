'use strict';

const { User } = require('../../models');
const db = require('../../models');
const { DataTypes, Op } = require('sequelize');
const WebSocket = require('ws');
const { logMessage, generateChatTableName } = require('./func.js');

const logType = 'WEBSOCKET';
const sessions = [];

const defineTable = (tableName) => {
  return db.sequelize.define(tableName, {
    sender: {
      type: DataTypes.STRING,
      allowNull: false
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
  });
};

// Function to handle WebSocket connection
const handleSocketConnection = async (ws) => {
  // Event listener for the 'message' event of the WebSocket, invoked when a message is received
  ws.on('message', async (message) => {
    const data = JSON.parse(message);

    // If client send username
    if (typeof data === 'string') {
      try {
        const sender = data;
        // Send all users
        const users = await User.findAll({ where: { username: { [Op.ne]: sender } } });
        const usernames = users.map(user => user.username);
        // Send user's contacts
        const user = await User.findOne({ where: { username: sender } });
        const userContacts = user.contacts || [];
        ws.send(JSON.stringify({
          users: usernames,
          contacts: userContacts
        }));
        return;
      } catch (error) {
        const errorMessage = `Can't fetch the user data: ${error}`;
        logMessage(logType, errorMessage, 'error'); // Logging the error message
      }
    }
    // Generating the table name for the chat
    const tableName = generateChatTableName(data.sender, data.receiver);
    const existingSession = sessions.find(
      (session) => session.sender === data.sender && session.receiver === data.receiver
    );

    // If no session for this dialog
    if (existingSession === undefined) {
      const newUser = {
        sender: data.sender,
        receiver: data.receiver,
        ws: ws
      };
      sessions.push(newUser); // Adding the new user session to the sessions array
      const infoMessage = `Session with sender: '${data.sender}' and receiver: '${data.receiver}' created`;
      logMessage(logType, infoMessage, 'success'); // Logging the session creation message
    }

    // If user sends info about current dialog
    if (!data.message) {
      // Fetching all tables in the database
      const tables = await db.sequelize.queryInterface.showAllSchemas();
      const suitableTables = tables.filter(
        (table) => table.Tables_in_converso_chat === tableName
      ); // Filtering tables based on the chat table name
      const count = suitableTables.length;
      const DialogTable = defineTable(tableName);

      // If table for current dialog alrady exists
      if (count === 0) {
        try {
          await DialogTable.sync(); // Creating the chat table if it doesn't exist
          const infoMessage = `Table with name ${tableName} was created`;
          logMessage(logType, infoMessage, 'success'); // Logging the table creation message
        } catch (error) {
          const errorMessage = `Table: ${tableName} was not created: ${error}`;
          logMessage(logType, errorMessage, 'error'); // Logging the error message
        }
      } else {
        try {
          const dialogs = await DialogTable.findAll(); // Fetching all dialogs from the chat table
          const formattedDialogs = dialogs.map((dialog) => ({
            sender: dialog.sender,
            history: dialog.message
          })); // Formatting the dialogs
          // Sending the formatted dialogs to the WebSocket client
          ws.send(JSON.stringify(formattedDialogs));
        } catch (error) {
          const errorMessage = `Error creating record: ${error}`;
          logMessage(logType, errorMessage, 'error'); // Logging the error message
        }
      }
    }

    // If user sends message
    if (data.message) {
      const DialogTable = defineTable(tableName);
      try {
        await DialogTable.create({
          sender: data.sender,
          receiver: data.receiver,
          message: data.message,
          createdAt: new Date(),
          updatedAt: new Date()
        }); // Creating a new record in the chat table for the sent message
        // Func to add contacts to db
        const addContact = async (sender, receiver) => {
          const user = await User.findOne({ where: { username: sender } });
          const userContacts = user.contacts || [];
          if (!userContacts.includes(receiver)) {
            userContacts.push(receiver);
          }
          user.contacts = userContacts;
          await user.save();
        };
        // Find sender and receiver users
        addContact(data.sender, data.receiver);
        addContact(data.receiver, data.sender);

        const infoMessage = `Send message from ${data.sender} to ${data.receiver}`;
        logMessage(logType, infoMessage, 'success'); // Logging sending message
      } catch (error) {
        const errorMessage = `Error creating record: ${error}`;
        logMessage(logType, errorMessage, 'error'); // Logging the error message
      }
    }

    // Send data to receiver if he online
    const receiverUser = sessions.find(
      (item) => item.sender === data.receiver && item.receiver === data.sender
    );
    if (
      receiverUser !== undefined
      && receiverUser.ws.readyState === WebSocket.OPEN
    ) {
      const senderMessage = {
        message: data.message,
        sender: data.sender
      };
      if (senderMessage.message) {
        // Sending the message to the receiver WebSocket client
        receiverUser.ws.send(JSON.stringify([senderMessage]));
      }
    }

    // Close event of the WebSocket, invoked when the WebSocket connection is closed
    ws.on('close', () => {
      const sessionIndex = sessions.findIndex(
        (item) => item.sender === data.sender && item.receiver === data.receiver
      );
      if (sessionIndex !== -1) {
        sessions.splice(sessionIndex, 1); // Removing the session from the sessions array
        const infoMessage = `Session of the sender '${data.sender}' with the recipient '${data.receiver}' was closed`;
        logMessage(logType, infoMessage, 'success'); // Logging the session closing message
      }
    });
  });
};

module.exports = handleSocketConnection;

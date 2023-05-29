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

const createNewSession = (sender, ws) => {
  const contactSession = sessions.find(
    (session) => (session.sender === sender)
  );
  if (!contactSession) {
    if (sender) {
      const newUser = {
        sender: sender,
        ws: ws
      };
      sessions.push(newUser); // Adding the new user session to the sessions array
      const infoMessage = `Session for users: '${newUser.sender}' created`;
      logMessage(logType, infoMessage, 'success'); // Logging the session creation message
    } else {
      const errorMessage = 'There are no receiver or sender for creating new session';
      logMessage(logType, errorMessage, 'error'); // Logging the error on creation message
    }
  } if (contactSession) {
    contactSession.ws = ws;
  }
};

// Function to handle WebSocket connection
const handleSocketConnection = async (ws) => {
  let currentUser;
  // Event listener for the 'message' event of the WebSocket, invoked when a message is received
  ws.on('message', async (message) => {
    // Parse data from client
    let data;
    try {
      data = JSON.parse(message);
    } catch (error) {
      // If an error occurred while parsing data
      const errorMessage = `Error parsing JSON: ${error}`;
      logMessage(logType, errorMessage, 'error');
      return;
    }

    // If client send username
    if ('username' in data) {
      try {
        const sender = data.username;
        currentUser = sender;
        // Find all users
        const users = await User.findAll({ where: { username: { [Op.ne]: sender } } });
        const usernames = users.map(user => user.username);
        // Find user's contacts
        const user = await User.findOne({ where: { username: sender } });
        const userContacts = user.contacts || [];
        // Find user's notification sound status
        const notificationSoundStatus = user.notificationSoundStatus;
        // Create Web Socket session
        createNewSession(sender, ws);
        ws.send(JSON.stringify({
          users: usernames,
          contacts: userContacts,
          notificationSoundStatus
        }));
        return;
      } catch (error) {
        const errorMessage = `Can't fetch the user data: ${error}`;
        logMessage(logType, errorMessage, 'error'); // Logging the error message
      }
    }

    // If client send notification sound status
    if ('notificationSoundStatus' in data) {
      try {
        const username = currentUser;
        const user = await User.findOne({ where: { username } });
        user.setDataValue('notificationSoundStatus', data.notificationSoundStatus);
        await user.save();
        return;
      } catch (error) {
        const errorMessage = `Can't fetch notification sound status: ${error}`;
        logMessage(logType, errorMessage, 'error'); // Logging the error message
      }
    }
    // Generating the table name for the chat
    const tableName = generateChatTableName(data.sender, data.receiver);

    // If user sends info about current dialog
    if (!data.message) {
      // Fetching all tables in the database
      const tables = await db.sequelize.queryInterface.showAllSchemas();
      const suitableTables = tables.filter(
        (table) => table.Tables_in_converso_chat === tableName
      ); // Filtering tables based on the chat table name
      const count = suitableTables.length;
      const DialogTable = defineTable(tableName);

      // If table for current dialog not exists
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
      createNewSession(data.sender, ws);
      const DialogTable = defineTable(tableName);
      try {
        await DialogTable.sync();
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
      (item) => (item.sender === data.receiver)
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
  });
  // Close event of the WebSocket, invoked when the WebSocket connection is closed
  ws.on('close', () => {
    const contactSessionIndex = sessions.findIndex(
      (session) => (session.sender === currentUser)
    );
    sessions.splice(contactSessionIndex, 1);
    const infoMessage = `Session of the sender '${currentUser}' was closed`;
    logMessage(logType, infoMessage, 'success'); // Log the message about the closing of sessions
  });
};

module.exports = handleSocketConnection;

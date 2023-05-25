const {User} = require('../../models');
const db = require('../../models');
const {DataTypes} = require('sequelize');
const {logMessage, generateChatTableName} = require('./func.js');

const logType = 'WEBSOCKET';

const defineTable = (tableName) => {
  return db.sequelize.define(tableName, {
    sender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receiver: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: db.Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    },
  });
};

// Function to handle WebSocket connection
const handleSocketConnection = async (ws) => {
  const users = await User.findAll();
  const usernames = users.map((item) => item.username);
  ws.send(JSON.stringify(usernames)); // Sending receivers to the WebSocket client

  // Event listener for the 'message' event of the WebSocket, invoked when a message is received
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    const tableName = generateChatTableName(data.sender, data.receiver); // Generating the table name for the chat

    // If user sends info about current dialog
    if (!data.message) {
      const tables = await db.sequelize.queryInterface.showAllSchemas(); // Fetching all tables in the database
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
            history: dialog.message,
          })); // Formatting the dialogs
          ws.send(JSON.stringify(formattedDialogs)); // Sending the formatted dialogs to the WebSocket client
        } catch (error) {
          const errorMessage = `Error creating record: ${error}`;
          logMessage(logType, errorMessage, 'error'); // Logging the error message
        }
      }
    }
  })
}

module.exports = handleSocketConnection;
const {User} = require('../models');
const {DataTypes} = require('sequelize');
const db = require('../models');

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
}

module.exports = handleSocketConnection;
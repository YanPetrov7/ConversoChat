'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    contacts: {
      type: DataTypes.TEXT, // Changed data type to TEXT
      allowNull: false,
      defaultValue: '[]', // Set the default value to an empty JSON array
      get() {
        // Parse stored JSON array when reading value from database
        const contacts = this.getDataValue('contacts');
        return JSON.parse(contacts);
      },
      set(contacts) {
        // Serialize and store a JSON array when setting a value to the database
        this.setDataValue('contacts', JSON.stringify(contacts));
      },
      validate: {
        notEmpty: true
      }
    },
    notificationSoundStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      validate: {
        notEmpty: true
      }
    }
  });
  return User;
};

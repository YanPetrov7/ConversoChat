const path = require('path');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { logMessage } = require('./func.js');
const logType = 'CONTROLLER';

exports.getWelcomePage = (req, res) => {
  const filePath = path.join(__dirname, '../pages/welcome.html');
  return res.sendFile(filePath);
};

exports.getLoginPage = (req, res) => {
  const filePath = path.join(__dirname, '../pages/login.html');
  return res.sendFile(filePath);
};

exports.getRegisterPage = (req, res) => {
  const filePath = path.join(__dirname, '../pages/register.html');
  return res.sendFile(filePath);
};

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send('Please enter both Username and Password!');
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      const errorMessage = `User with username: '${username}' already exists`;
      logMessage(logType, errorMessage, 'error'); // Logging error, user already exists
      return res.send(errorMessage);
    }

    const hash = await bcrypt.hash(password, 10);
    req.session.loggedin = true;
    req.session.username = username;
    await User.create({ username, password: hash });

    const infoMessage = `Created new user with name ${username}`;
    logMessage(logType, infoMessage, 'success'); // Logging succsessful login message
    // Redirect to future page
  } catch (err) {
    const errorMessage = `Error occurred while registering user: ${err.message}`;
    logMessage(logType, errorMessage, 'error'); // Logging error while registering user
    return res.send(errorMessage);
  }
};
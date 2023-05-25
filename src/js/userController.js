const path = require('path');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { logMessage } = require('./func.js');
const logType = 'CONTROLLER';

exports.getWelcomePage = (req, res) => {
  if (req.session.loggedin) {
    const username = req.session.username;
    return res.redirect(`/home?user=${username}`);
  }
  const filePath = path.join(__dirname, '../pages/welcome.html');
  return res.sendFile(filePath);
};

exports.getLoginPage = (req, res) => {
  if (req.session.loggedin) {
    const username = req.session.username;
    return res.redirect(`/home?user=${username}`);
  }
  const filePath = path.join(__dirname, '../pages/login.html');
  return res.sendFile(filePath);
};

exports.getRegisterPage = (req, res) => {
  if (req.session.loggedin) {
    const username = req.session.username;
    return res.redirect(`/home?user=${username}`);
  }
  const filePath = path.join(__dirname, '../pages/register.html');
  return res.sendFile(filePath);
};

exports.getHomePage = (req, res) => {
  if (req.session.loggedin) {
    const filePath = path.join(__dirname, '../pages/home.html');
    return res.sendFile(filePath);
  } else {
    return res.redirect('/');
  }
};

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) { // If username or password is missing
    return res.send('Please enter both Username and Password!');
  }

  try {
    const existingUser = await User.findOne({ where: { username } }); // Checking if user already exists
    if (existingUser) { // If user already exists
      const errorMessage = `User with username: '${username}' already exists`;
      logMessage(logType, errorMessage, 'error'); // Logging error, user already exists
      return res.send(errorMessage);
    }

    const hash = await bcrypt.hash(password, 10);
    req.session.loggedin = true;
    req.session.username = username;
    await User.create({ username, password: hash });

    const infoMessage = `Created user with name ${username}`;
    logMessage(logType, infoMessage, 'success'); // Logging succsessful login message
    return res.redirect(`/home?user=${username}`);
  } catch (err) {
    const errorMessage = `Error occurred while registering user: ${err.message}`;
    logMessage(logType, errorMessage, 'error'); // Logging error while registering user
    return res.send(errorMessage);
  }
};
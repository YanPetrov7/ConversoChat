'use strict';

const path = require('path');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { logMessage, passwordСheck } = require('./func.js');
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
  }
  return res.redirect('/');
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.send('Please enter both Username and Password!');
  }

  try {
    const user = await User.findOne({ where: { username } }); // Finding the user by username
    if (!user) { // If user does not exist
      const errorMessage = `No user with name: '${username}'`;
      logMessage(logType, errorMessage, 'error');
      return res.send(errorMessage);
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) { // If password matches
      req.session.loggedin = true;
      req.session.username = username;
      const infoMessage = `User with username: '${username}' is logging in`;
      logMessage(logType, infoMessage, 'success'); // Logging succsessful login message
      return res.redirect(`/home?user=${username}`);
    }
    const errorMessage = `Invalid password for User: '${username}' `;
    logMessage(logType, errorMessage, 'error'); // Logging error, invalid password message
    return res.send(errorMessage);
  } catch (err) {
    const errorMessage = `Error occurred while logging in: ${err.message}`;
    logMessage(logType, errorMessage, 'error'); // Logging error while logging in
    return res.send(errorMessage);
  }
};

exports.registerUser = async (req, res) => {
  const { username, password, repeatPassword } = req.body;
  if (!username || !password || !repeatPassword) { // If username or password is missing
    return res.send('Please enter both Username and Password!');
  }

  if (!passwordСheck(password)) {
    return res.send('Password length should be at least 8 characters.\nPassword should include a combination of uppercase and lowercase letters.\nPassword should contain only Latin letters and numbers.');
  }

  if (repeatPassword !== password) { // If username or password is missing
    return res.send('Password is not equal to the repeated password');
  }

  try {
    // Checking if user already exists
    const existingUser = await User.findOne({ where: { username } });
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

exports.logoutUser = (req, res) => {
  const username = req.session.username;
  req.session.loggedin = false;
  req.session.username = null;
  const infoMessage = `Log out user with name: '${username}'`;
  logMessage(logType, infoMessage, 'success'); // Logging succsessful login message
  return res.redirect('/');
};

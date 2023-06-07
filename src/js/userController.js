'use strict';

const path = require('path');
const { User } = require('../../models');
const bcrypt = require('bcrypt');
const { logMessage, passwordСheck, usernameСheck } = require('./func.js');
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
    if (!req.query.user || req.query.user !== req.session.username) {
      const username = req.session.username;
      return res.redirect(302, `/home?user=${username}`);
    }
    const filePath = path.join(__dirname, '../pages/home.html');
    return res.sendFile(filePath);
  }
  return res.redirect('/');
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    const errorCode = 400;
    const errorMessage = 'Please enter both Username and Password!';
    return res.status(errorCode).send(errorMessage);
  }

  try {
    const user = await User.findOne({ where: { username } }); // Finding the user by username
    if (!user) { // If user does not exist
      const errorCode = 404;
      const errorMessage = `No user with name: '${username}'`;

      logMessage(logType, errorMessage, 'error');
      return res.status(errorCode).send(errorMessage);
    }

    const result = await bcrypt.compare(password, user.password);
    if (result) { // If password matches
      req.session.loggedin = true;
      req.session.username = username;

      const redirectCode = 302;
      const infoMessage = `User with username: '${username}' is logging in`;

      logMessage(logType, infoMessage, 'success'); // Logging succsessful login message
      return res.redirect(redirectCode, `/home?user=${username}`);
    }
    const errorCode = 401;
    const errorMessage = `Invalid password for User: '${username}'`;

    logMessage(logType, errorMessage, 'error'); // Logging error, invalid password message
    return res.status(errorCode).send(errorMessage);
  } catch (err) {
    const errorCode = 401;
    const errorMessage = `Error occurred while logging in: ${err.message}`;
    logMessage(logType, errorMessage, 'error'); // Logging error while logging in
    return res.status(errorCode).send(errorMessage);
  }
};

exports.registerUser = async (req, res) => {
  const { username, password, repeatedPassword } = req.body;
  if (!username || !password || !repeatedPassword) { // If username or password is missing
    const errorCode = 400;
    const errorMessage = 'Please enter username, password and repeated password!';
    return res.status(errorCode).send(errorMessage);
  }

  if (!usernameСheck(username)) {
    const errorCode = 401;
    const errorMessage = 'Username length should be: at least 5 characters, contain only Latin letters and numbers';
    return res.status(errorCode).send(errorMessage);
  }

  if (!passwordСheck(password)) {
    const errorCode = 402;
    const errorMessage = 'Password length should be: at least 8 characters, include a combination of uppercase and lowercase letters, contain only Latin letters and numbers.';
    return res.status(errorCode).send(errorMessage);
  }

  if (repeatedPassword !== password) { // If username or password is missing
    const errorCode = 403;
    const errorMessage = 'Password is not equal to the repeated password';
    return res.status(errorCode).send(errorMessage);
  }

  try {
    // Checking if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) { // If user already exists
      const errorCode = 404;
      const errorMessage = `User with username: '${username}' already exists`;
      logMessage(logType, errorMessage, 'error'); // Logging error, user already exists
      return res.status(errorCode).send(errorMessage);
    }

    const hash = await bcrypt.hash(password, 10);
    req.session.loggedin = true;
    req.session.username = username;
    await User.create({ username, password: hash });

    const redirectCode = 302;
    const infoMessage = `Created user with name ${username}`;
    logMessage(logType, infoMessage, 'success'); // Logging succsessful login message
    return res.redirect(redirectCode, `/home?user=${username}`);
  } catch (err) {
    const errorCode = 500;
    const errorMessage = `Error occurred while registering user: ${err.message}`;
    logMessage(logType, errorMessage, 'error'); // Logging error while registering user
    return res.status(errorCode).send(errorMessage);
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

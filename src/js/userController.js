const path = require('path');

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
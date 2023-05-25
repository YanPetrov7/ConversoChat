const path = require('path');

exports.getWelcomePage = (req, res) => {
  const filePath = path.join(__dirname, '../pages/welcome.html');
  return res.sendFile(filePath);
};
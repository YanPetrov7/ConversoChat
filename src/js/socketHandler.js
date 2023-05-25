const {User} = require('../../models');

// Function to handle WebSocket connection
const handleSocketConnection = async (ws) => {
  const users = await User.findAll();
  const usernames = users.map((item) => item.username);
  ws.send(JSON.stringify(usernames)); // Sending receivers to the WebSocket client
}

module.exports = handleSocketConnection;
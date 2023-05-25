const http = require('http');
const express = require('express');
const session = require('express-session');
const routes = require('./routes.js');
const WebSocket = require('ws');

const app = express();
const port = 3000;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server: server });

app.use(
  session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routes);

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
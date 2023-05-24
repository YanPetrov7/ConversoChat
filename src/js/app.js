const http = require('http');
const express = require('express');
const session = require('express-session');

const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(
  session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
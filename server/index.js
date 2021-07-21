const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { log } = require('./util');
const { Game } = require('./dist/index');

const port = 3000;

const absPath = relPath => path.resolve(__dirname, relPath);

app.use('/', express.static(absPath('../public')));

app.use('/', express.static(absPath('../node_modules/socket.io/client-dist/')));

app.get('/', (_req, res) => {
  res.sendFile(absPath('index.html'));
});

app.get('/admin', (req, res) => {
  res.cookie('admin', 'true').redirect('/');
});

console.clear();

server.listen(port, () => {
  new Game(server);

  log(`Game server started. Sockets on *:${port}`);
});

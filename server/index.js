const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { log } = require('./util');
const { Game } = require('./dist/index');

const passedPort = parseInt(process.argv[2]);
const port = isNaN(passedPort) ? 3000 : passedPort;

const absPath = relPath => path.resolve(__dirname, relPath);

const game = new Game(server);

app.use('/', express.static(absPath('../public')));

app.use('/', express.static(absPath('../node_modules/socket.io/client-dist/')));

app.get('/', (_req, res) => {
  res.sendFile(absPath('index.html'));
});

app.get('/admin', (req, res) => {
  const pw = req.query['pw'];
  console.log(pw);
  if (process.env['ADMIN_PW'] && pw !== process.env['ADMIN_PW']) {
    return res.status(401).send('Incorrect admin password');
  }
  game.reset();
  res
    .cookie('admin-358b2120-3ee5-4379-b05b-7c6b59097626', 'true')
    .redirect('/');
});

console.clear();

server.listen(port, () => {
  log(`Game server started on *:${port}`);
});

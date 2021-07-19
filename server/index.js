const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const { v4: uuidv4 } = require('uuid');
const { info, error } = require('./util');
// const fs = require('fs');
const { Game } = require('./dist/index');

const port = 3000;
// const html404 = fs.readFileSync(absPath('./404.html'));

const absPath = relPath => path.resolve(__dirname, relPath);

// HTTP
app.use('/game', express.static(absPath('../public')));

app.use(
  '/game',
  express.static(absPath('../node_modules/socket.io/client-dist/')),
);

app.get('/game/:id', (req, res) => {
  const id = req.params.id;
  if (!Game.games.has(id)) {
    const errMsg = `404 (Not Found): Game with id "${id}" not found`;
    error(errMsg);
    return res.status(404).send(errMsg);
  }
  res.sendFile(absPath('index.html'));
});

app.get(['/create/:id', '/create'], (req, res) => {
  const id = req.params.id || uuidv4();
  try {
    new Game(id);
  } catch (e) {
    const errMsg = `409 (Conflict): ${e.message}`;
    error(errMsg);
    return res.status(409).send(errMsg);
  }
  info(`Game "${id}" created`);
  res.redirect('/admin');
});

app.get('/admin', (req, res) => {
  const json = [];
  Game.games.forEach((game, id) => {
    const gameInfo = {
      id,
      url: `${req.headers.host}/game/${id}`,
      players: [],
    };
    json.push(gameInfo);
  });
  res.send('<pre>' + JSON.stringify(json, null, 4) + '</pre>');
});

// Sockets
io.on('connection', socket => {
  console.log('a user connected');
  socket.on('test', data => {
    console.log('TEST', data);
  });
});

server.listen(port, () => {
  info(`Game server started. Sockets on *:${port}`);
});

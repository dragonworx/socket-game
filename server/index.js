const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
// const { Server } = require('socket.io');
// const io = new Server(server);
const { info } = require('./util');
const { Game } = require('./dist/index');

const port = 3000;

const absPath = relPath => path.resolve(__dirname, relPath);

new Game(server);

// HTTP
app.use('/', express.static(absPath('../public')));

app.use('/', express.static(absPath('../node_modules/socket.io/client-dist/')));

app.get('/', (_req, res) => {
  res.sendFile(absPath('index.html'));
});

app.get('/admin', (req, res) => {
  res.cookie('admin', 'true').redirect('/');
});

// Sockets
// io.on('connection', socket => {
//   info(`New socket ${socket.id} connected from ${socket.handshake.address}`);

//   game.addPlayer(socket);
//   log(`${game.players.length} player(s)`);

//   socket.on('request.game.info', () => {
//     socket.emit('response.game.info', game.getInfo());
//   });

//   socket.on('disconnect', () => {
//     game.removePlayer(socket);
//     info(`Socket ${socket.id} disconnected from ${socket.handshake.address}`);
//     log(`${game.players.length} player(s)`);
//   });
// });

// Start Server
console.clear();
server.listen(port, () => {
  info(`Game server started. Sockets on *:${port}`);
});

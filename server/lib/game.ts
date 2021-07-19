// import { Socket } from 'socket.io-client';
import { Server, Socket } from 'socket.io';
import { Player } from './player';
import { info, log } from '../util';
import { GameStatus, GameInfo } from '../../common';

// type GameStatus = 'waiting' | 'active' | 'over';

// interface PlayerInfo {
//   id: string;
//   ip: string;
// }

// interface GameInfo {
//   status: GameStatus;
//   players: PlayerInfo[];
// }

export class Game {
  io: Server;
  status: GameStatus;
  players: Player[];

  constructor(server: any) {
    this.io = new Server(server);
    this.status = 'waiting';
    this.players = [];
    this.initSockets();
  }

  initSockets() {
    this.io.on('connection', socket => {
      this.addPlayer(socket);

      socket.on('client.game.info', () => {
        log(`client[${socket.id}].game.info`);
        socket.emit('server.game.info', this.getInfo());
      });

      socket.on('client.player.remove', id => {
        log(`client[${socket.id}].player.remove`);
        this.removePlayer(id);
      });

      socket.on('client.player.setName', name => {
        log(`client[${socket.id}].player.setName: "${name}"`);
        this.setPlayerName(socket.id, name);
      });

      socket.on('disconnect', () => {
        info(
          `Socket ${socket.id} disconnected from ${socket.handshake.address}`,
        );
        this.removePlayer(socket.id);
      });
    });
  }

  addPlayer(socket: Socket) {
    info(`New socket ${socket.id} connected from ${socket.handshake.address}`);
    const player = new Player(socket);
    this.players.push(player);
    log(`${this.players.length} player(s)`);
    socket.broadcast.emit('server.game.info', this.getInfo());
  }

  removePlayer(id: string) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      log(`Remove player ${player.socket.id}`);
      const socket = player.socket;
      this.players = this.players.filter(player => player.socket !== socket);
      log(`${this.players.length} player(s)`);
      this.io.emit('server.game.info', this.getInfo());
    }
  }

  setPlayerName(id: string, name: string) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      log(`Set player name ${player.socket.id}: "${name}"`);
      player.name = name;
      this.io.emit('server.game.info', this.getInfo());
    }
  }

  getInfo(): GameInfo {
    // return game status, and basic player info (high level, not part of game loop)
    return {
      status: this.status,
      players: this.players.map(player => ({
        name: player.name,
        id: player.socket.id,
        ip: player.socket.request.socket.remoteAddress || '?',
      })),
    };
  }
}

import { Server, Socket } from 'socket.io';
import { Player } from './player';
import { info, log, ws, warn } from '../util';
import { GameStatus, GameState } from '../../common';

export class Game {
  io: Server;
  status: GameStatus;
  players: Player[];

  constructor(server: any) {
    this.io = new Server(server);
    this.status = 'waiting';
    this.players = [];
    this.initSocketHandlers();
  }

  reset() {
    this.status = 'waiting';
    this.updateClientsGameState();
  }

  kickAllPlayers() {
    this.players.forEach(player => {
      player.socket.disconnect(true);
    });
    this.players = [];
    this.reset();
  }

  initSocketHandlers() {
    this.io.on('connection', socket => {
      this.addPlayer(socket);

      socket.on('client.game.state', () => {
        ws(`client[${socket.id}].game.state`);
        socket.emit('server.game.state', this.getGameState());
      });

      socket.on('client.player.remove', id => {
        ws(`client[${socket.id}].player.remove`);
        this.removePlayer(id);
      });

      socket.on('client.player.setName', name => {
        ws(`client[${socket.id}].player.setName: "${name}"`);
        this.setPlayerName(socket.id, name);
      });

      socket.on('client.game.start', () => {
        ws(`client[${socket.id}].game.start`);
        this.start();
      });

      socket.on('client.game.end', () => {
        ws(`client[${socket.id}].game.end`);
        this.end();
      });

      socket.on('client.game.reset', () => {
        ws(`client[${socket.id}].game.reset`);
        this.reset();
      });

      socket.on('client.ping', () => {
        socket.emit('server.pong');
      });

      socket.on('disconnect', () => {
        warn(
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
    socket.broadcast.emit('server.game.state', this.getGameState());
  }

  removePlayer(id: string) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      info(`Remove player ${player.socket.id}`);
      const socket = player.socket;
      this.players = this.players.filter(player => player.socket !== socket);
      log(`${this.players.length} player(s)`);
      this.updateClientsGameState();
    }
  }

  setPlayerName(id: string, name: string) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      info(`Set player name ${player.socket.id}: "${name}"`);
      player.name = name;
      this.updateClientsGameState();
    }
  }

  updateClientsGameState() {
    this.io.emit('server.game.state', this.getGameState());
  }

  start() {
    info('Game start');
    this.status = 'active';
    this.init();
    this.updateClientsGameState();
  }

  init() {
    //todo: setup initial game and players state
  }

  end() {
    info('Game end');
    this.status = 'over';
    this.updateClientsGameState();
  }

  getGameState(): GameState {
    const gameState = {
      status: this.status,
    };
    switch (this.status) {
      case 'waiting':
        return {
          ...gameState,
          players: this.players.map(player => ({
            name: player.name,
            id: player.socket.id,
            ip: player.socket.request.socket.remoteAddress || '?',
          })),
        };
      case 'active':
        return {
          ...gameState,
          players: this.players.map(player => ({
            name: player.name!,
            id: player.socket.id,
            x: player.x,
            y: player.y,
          })),
        };
      default:
        return gameState;
    }
  }
}

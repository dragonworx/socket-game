import { Server, Socket } from 'socket.io';
import { Player } from './player';
import { info, log, ws, warn } from '../util';
import { GameStatus, GameState, PlayerInfo } from '../../common';

export class Game {
  io: Server;
  status: GameStatus;
  players: Player[];
  width: number = 600;
  height: number = 500;

  constructor(server: any) {
    this.io = new Server(server);
    this.status = 'waiting';
    this.players = [];
    this.initSocketHandlers();
  }

  reset() {
    this.status = 'waiting';
    this.players.forEach(player => {
      player.info.isAlive = true;
      player.info.health = 100;
      player.info.score = 0;
    });
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

      socket
        .on('client.game.state', () => {
          ws(`client[${socket.id}].game.state`);
          socket.emit('server.game.state', this.getGameState());
        })
        .on('client.player.remove', id => {
          ws(`client[${socket.id}].player.remove`);
          this.removePlayer(id);
        })
        .on('client.player.join', name => {
          ws(`client[${socket.id}].player.setName: "${name}"`);
          this.playerJoined(socket.id, name);
        })
        .on('client.game.start', () => {
          ws(`client[${socket.id}].game.start`);
          this.start();
        })
        .on('client.game.end', () => {
          ws(`client[${socket.id}].game.end`);
          this.end();
        })
        .on('client.game.reset', () => {
          ws(`client[${socket.id}].game.reset`);
          this.reset();
        })
        .on('client.input.keydown', code => {
          // ws(`client[${socket.id}].input.keydown: ${code}`);
          socket.broadcast.emit('server.input.keydown', {
            id: socket.id,
            code,
          });
        })
        .on('client.input.keyup', code => {
          // ws(`client[${socket.id}].input.keyup: ${code}`);
          socket.broadcast.emit('server.input.keyup', { id: socket.id, code });
        })
        .on('client.player.damage', health => {
          ws(`client[${socket.id}].player.damage: ${health}`);
          this.playerDamaged(socket.id, health);
        })
        .on('client.player.score', (score: number, totalCells: number) => {
          ws(`client[${socket.id}].player.score: ${score}`);
          this.playerScore(socket.id, score, totalCells);
        })
        .on('client.player.dead', score => {
          ws(`client[${socket.id}].player.dead`);
          this.playerDead(socket.id);
        })
        .on('client.ping', () => {
          socket.emit('server.pong');
        })
        .on('disconnect', () => {
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

  playerJoined(id: string, name: string) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      info(`Player joined ${player.socket.id}: "${name}"`);
      player.info.name = name;
      this.updateClientsGameState();
      this.io.emit('server.player.joined', player.info);
    }
  }

  playerDamaged(id: string, health: number) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      info(`Player ${player.info.name} damaged: ${health}`);
      player.info.health = health;
      this.updateClientsGameState();
    }
  }

  playerScore(id: string, score: number, totalCells: number) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      info(
        `Player ${player.info.name} score: ${score} totalCells: ${totalCells}`,
      );
      player.info.score = score;
      if (totalCells <= 0) {
        info(`Player ${player.info.name} wins!`);
        this.status = 'over';
        this.io.emit('server.player.wins', player.info);
      }
      this.updateClientsGameState();
    }
  }

  playerDead(id: string) {
    const player = this.players.find(player => player.socket.id === id);
    if (player) {
      info(`Player ${player.info.name} dead!`);
      player.info.isAlive = false;
      const alivePlayers = this.players.filter(
        player => player.info.isAlive,
      ).length;
      if (alivePlayers === 0) {
        info(`All players dead game over!`);
        this.status = 'over';
      }
      this.io.emit('server.player.dead', player.info);
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

  init() {}

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
          players: this.players.map(player => player.info),
        };
      case 'active':
        return {
          ...gameState,
          players: this.players.map(player => player.info),
        };
      default:
        return gameState;
    }
  }
}

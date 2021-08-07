import { Socket } from 'socket.io';
import { PlayerInfo } from '../../common';

export class Player {
  static size: number = 10;

  socket: Socket;
  info: PlayerInfo;

  constructor(socket: Socket) {
    this.socket = socket;
    this.info = {
      id: socket.id,
      ip: socket.request.socket.remoteAddress || '?',
      name: '',
      score: 0,
      health: 100,
      isAlive: true,
    };
  }
}

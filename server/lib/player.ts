import { Socket } from 'socket.io';

export class Player {
  static size: number = 10;

  socket: Socket;
  name?: string;
  x: number;
  y: number;

  constructor(socket: Socket) {
    this.socket = socket;
    this.x = 0;
    this.y = 0;
  }
}

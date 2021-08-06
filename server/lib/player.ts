import { Socket } from 'socket.io';

export class Player {
  static size: number = 10;

  socket: Socket;
  name?: string;

  constructor(socket: Socket) {
    this.socket = socket;
  }
}

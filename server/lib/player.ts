import { Socket } from 'socket.io';

export class Player {
  socket: Socket;
  name?: string;

  constructor(socket: Socket) {
    this.socket = socket;
  }
}

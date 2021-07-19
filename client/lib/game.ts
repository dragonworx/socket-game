import io from "socket.io-client";

// const socket = io();
// socket.emit("test", { x: 1 });

import { Player } from "./player";

export class Game {
  players: Player[];

  constructor() {
    this.players = [];
  }
}

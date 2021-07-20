import io, { Socket } from "socket.io-client";
import { EventEmitter } from "eventemitter3";
import { Player } from "./player";
import { GameInfo } from "../common";

const defaultGameInfo: GameInfo = {
  status: "unconnected",
  players: [],
};

export class Game extends EventEmitter {
  static instance: Game = new Game();

  players: Player[];
  socket: Socket;
  playerName?: string;
  info: GameInfo = defaultGameInfo;

  constructor() {
    super();
    this.players = [];
    this.socket = io();
    this.socket.on("server.game.info", (info) => {
      this.info = info;
      // check this player hasn't been removed, if so reload
      if (!this.info.players.find((player) => player.id === this.socket.id)) {
        window.location.reload();
      }
      this.emit("game.info", info);
    });
    this.socket.emit("client.game.info");
  }

  removePlayer(id: string) {
    this.socket.emit("client.player.remove", id);
  }

  join(name: string) {
    this.playerName = name;
    this.socket.emit("client.player.setName", name);
  }
}

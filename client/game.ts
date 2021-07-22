import io, { Socket } from "socket.io-client";
import { EventEmitter } from "eventemitter3";
import { GameState, isWaitingGameState, isActiveGameState } from "../common";

export class Game extends EventEmitter {
  static instance: Game = new Game();

  socket: Socket;
  playerName?: string;
  state: GameState;

  constructor() {
    super();
    this.state = { status: "unconnected" };
    this.socket = io();
    this.initSocketHandlers();
    this.socket.emit("client.game.state");
  }

  initSocketHandlers() {
    this.socket.on("server.game.state", (gameState: GameState) => {
      this.state = gameState;

      if (isWaitingGameState(gameState)) {
        if (!gameState.players.find((player) => player.id === this.socket.id)) {
          window.location.reload();
        }
      } else if (isActiveGameState(gameState)) {
        //todo...
      }

      this.emit("game.state.changed", gameState);
    });

    this.socket.on("server.pong", () => {
      this.emit("pong");
    });
  }

  removePlayer(id: string) {
    this.socket.emit("client.player.remove", id);
  }

  join(name: string) {
    this.playerName = name;
    this.socket.emit("client.player.setName", name);
  }

  start() {
    this.socket.emit("client.game.start");
  }
}

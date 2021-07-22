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

    this.socket.on("disconnect", () => {
      this.state = {
        status: "unconnected",
      };
      this.emit("game.state.changed", this.state);
    });
  }

  removePlayer(id: string) {
    if (id === this.socket.id) {
      return window.location.reload();
    }
    this.socket.emit("client.player.remove", id);
  }

  join(name: string) {
    this.playerName = name;
    this.socket.emit("client.player.setName", name);
  }

  start() {
    this.socket.emit("client.game.start");
  }

  end() {
    this.socket.emit("client.game.end");
  }

  reset() {
    this.socket.emit("client.game.reset");
  }
}

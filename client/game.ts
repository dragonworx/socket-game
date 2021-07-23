import io, { Socket } from "socket.io-client";
import { EventEmitter } from "eventemitter3";
import { GameState, isWaitingGameState, isActiveGameState } from "../common";
import { InputManager, KeyEvent } from "./inputManager";
import { throttled } from "./util";

export class Game extends EventEmitter {
  static instance: Game = new Game();

  socket: Socket;
  playerName?: string;
  state: GameState;
  inputManager: InputManager;
  canvasBg?: HTMLCanvasElement;
  canvasFg?: HTMLCanvasElement;
  width: number;
  height: number;

  constructor() {
    super();
    this.state = { status: "unconnected" };
    this.socket = io();
    this.initSocketHandlers();
    this.socket.emit("client.game.state");
    requestAnimationFrame(this.updateFrame);
    this.inputManager = new InputManager([
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ]);
    this.inputManager.on("keypress", throttled(this.onKeyDown, 1000 / 60));
    this.width = 0;
    this.height = 0;
  }

  initSocketHandlers() {
    this.socket.on("server.game.state", (gameState: GameState) => {
      this.state = gameState;

      if (isWaitingGameState(gameState)) {
        if (!gameState.players.find((player) => player.id === this.socket.id)) {
          window.location.reload();
        }
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

  onKeyDown = (e: KeyEvent) => {
    if (isActiveGameState(this.state)) {
      this.socket.emit("client.input.keydown", e.code);
    }
  };

  updateFrame = (time: number) => {
    if (isActiveGameState(this.state) && this.canvasBg && this.canvasFg) {
      const ctx = this.canvasFg.getContext("2d")!;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px sans-serif";
      this.state.players.forEach((player) => {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillText(player.name, player.x + 15, player.y);
        ctx.closePath();
      });
    }
    requestAnimationFrame(this.updateFrame);
  };
}

import io, { Socket } from "socket.io-client";
import { EventEmitter } from "eventemitter3";
import { InputManager } from "../inputManager";
import { RemoteInputChannel, StandardInputMap } from "../inputChannel";
import { Animator } from "./animator";
import { Player } from "./player";
import { createElement } from "./util";
import { Graphics } from "./graphics";
import { Grid, Direction, Buffers as GridBuffer } from "./grid";
import {
  GameState,
  isWaitingGameState,
  isActiveGameState,
  PlayerInfo,
} from "../../common";

export const GridSize = 10;

export class Game extends EventEmitter {
  static instance: Game = new Game();

  socket: Socket;
  state: GameState;
  userPlayer?: Player;
  players: Player[] = [];
  inputManager: InputManager;
  animator: Animator;
  spritesContainer: HTMLDivElement;
  graphics: Graphics;
  grid: Grid;

  constructor() {
    super();
    this.socket = io();
    this.state = { status: "unconnected" };
    this.animator = new Animator(15);
    this.animator.on("frame", this.onFrame);
    this.inputManager = new InputManager();
    this.inputManager
      .createKeyboardChannel(
        new Map(
          Object.entries({
            Space: "Space",
            Enter: "Enter",
          })
        )
      )
      .on("keydown", this.onGeneralKeyInput);
    this.spritesContainer = createElement("div", "sprites");
    this.graphics = new Graphics();
    this.grid = new Grid(GridSize, GridSize, this.spritesContainer);
    this.initSocketHandlers();
    this.socket.emit("client.game.state");
  }

  initSocketHandlers() {
    this.socket
      .on("server.game.state", (gameState: GameState) => {
        console.log("server.game.state", gameState);
        this.state = gameState;

        if (isWaitingGameState(gameState)) {
          if (
            !gameState.players.find((player) => player.id === this.socket.id)
          ) {
            window.location.reload();
          }
        }

        this.emit("game.state.changed", gameState);
      })
      .on("server.player.joined", (playerInfo: PlayerInfo) => {
        const { spritesContainer } = this;
        this.emit("game.player.joined", playerInfo);
        if (playerInfo.id === this.socket.id && this.userPlayer) {
          console.log("Added user player sprite", this.userPlayer.info.name);
          spritesContainer.appendChild(this.userPlayer.sprite);
          this.userPlayer.info.id = playerInfo.id;
        } else {
          const player = this.newRemotePlayer(playerInfo);
          player.setName(playerInfo.name!);
          player.info.id = playerInfo.id;
          spritesContainer.appendChild(player.sprite);
          console.log("added sprite for player " + player.info.name);
        }
        this.refreshPlayerInitialLayout();
      })
      .on("server.player.dead", (playerInfo: PlayerInfo) => {
        const player = this.findPlayer(playerInfo.id);
        player.setIsDead();
      })
      .on("server.player.wins", (playerInfo: PlayerInfo) => {
        const player = this.findPlayer(playerInfo.id);
        alert(`Player ${player.info.name} wins!`);
      })
      .on("server.pong", () => {
        this.emit("pong");
      })
      .on("disconnect", () => {
        this.state = {
          status: "unconnected",
        };
        this.emit("game.state.changed", this.state);
      });
  }

  init(gameView: HTMLDivElement) {
    const { spritesContainer } = this;
    const { offsetWidth: width, offsetHeight: height } = gameView;
    this.grid.init(width, height);
    this.graphics.setSize(width, height);
    this.grid.graphics.addBuffersToContainer(gameView);
    this.graphics.addBuffersToContainer(gameView);
    gameView.appendChild(spritesContainer);
    this.animator.start();
  }

  start() {
    this.socket.emit("client.game.start");
  }

  end() {
    this.socket.emit("client.game.end");
  }

  setSpritesContainer(element: HTMLDivElement) {
    this.spritesContainer = element;
  }

  reset() {
    this.socket.emit("client.game.reset");
    this.grid.reset();
    this.players.forEach((player) => {
      player.info.score = 0;
      player.info.health = 100;
      player.info.isAlive = true;
    });
    this.refreshPlayerInitialLayout();
  }

  findPlayer(id: string) {
    return this.players.find((player) => player.info.id === id)!;
  }

  refreshPlayerInitialLayout() {
    this.distributePlayerInitialPositions();
    this.setPlayersInitialPositions();
  }

  distributePlayerInitialPositions() {
    //todo: enumerate all players and distribute evenly around edges
    this.setPlayerToCellEdge(
      this.players[0],
      Math.floor(GridSize / 2),
      0,
      "left",
      1
    );
    if (this.players.length === 2) {
      this.setPlayerToCellEdge(
        this.players[1],
        0,
        Math.floor(GridSize / 2),
        "bottom",
        1
      );
    }
  }

  setPlayerToCellEdge(
    player: Player,
    hGridIndex: number,
    vGridIndex: number,
    edgeName: string,
    direction: Direction
  ) {
    const cell = this.grid.getCell(hGridIndex, vGridIndex);
    const edge = (cell as any)[edgeName];
    player.setEdge(edge, direction);
  }

  setPlayersInitialPositions() {
    this.players.forEach((player) => {
      player.setSpriteToCurrentPosition();
    });
  }

  onGeneralKeyInput = (code: string) => {
    switch (code) {
      case "Space":
        this.animator.toggleRunning();
        break;
      case "Enter":
        this.step();
    }
  };

  onFrame = () => {
    this.step();
  };

  step() {
    if (isActiveGameState(this.state)) {
      this.players.forEach((player) => {
        if (player.info.isAlive) {
          player.move();
          player.setSpriteToCurrentPosition();
        }
      });
      const cutsBuffer = this.grid.graphics.getBuffer(GridBuffer.Cuts);
      cutsBuffer.batchImageDataOps(() => {
        this.players.forEach(
          (player) => player.info.isAlive && player.renderCurrentPosition()
        );
      });
    }
  }

  removePlayer(id: string) {
    if (id === this.socket.id) {
      return window.location.reload();
    }
    this.socket.emit("client.player.remove", id);
  }

  join(name: string) {
    this.socket.emit("client.player.join", name);
    const player = (this.userPlayer = this.newKeyboardPlayer(StandardInputMap));
    player.setName(name);
  }

  newKeyboardPlayer(mapping: Map<string, string>) {
    const inputChannel = this.inputManager.createKeyboardChannel(mapping);
    const player = new Player(inputChannel);
    this.players.push(player);
    return player;
  }

  newRemotePlayer(playerInfo: PlayerInfo) {
    const inputChannel = new RemoteInputChannel(
      StandardInputMap,
      this.socket,
      playerInfo
    );
    const player = new Player(inputChannel);
    this.players.push(player);
    return player;
  }
}

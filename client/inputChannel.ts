import { EventEmitter } from "eventemitter3";
import { Socket } from "socket.io-client";
import { PlayerInfo, RemoteInput } from "../common";

export type InputChannelType = string;

export const StandardInputMap = new Map(
  Object.entries({
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
  })
);

export class InputChannel<T> extends EventEmitter {
  mapping: Map<T, string>;
  bufferSize: number;
  buffer: T[] = [];
  bufferClearTimeoutMs: number;
  bufferClearTimeoutId: number = -1;
  activeInput: Map<T, number> = new Map();

  constructor(
    mapping: Map<T, string> = new Map(),
    bufferSize: number = 1,
    bufferClearTimeoutMs: number = 3000
  ) {
    super();
    this.mapping = mapping;
    this.bufferSize = bufferSize;
    this.bufferClearTimeoutMs = bufferClearTimeoutMs;
  }

  get hasMappedInput() {
    return this.mapping.size && this.activeInput.size > 0;
  }

  isInputActive(input: T) {
    return this.activeInput.has(input);
  }

  allowInput(input: T) {
    return this.mapping.size ? this.mapping.has(input) : true;
  }

  activateInput(input: T) {
    this.activeInput.set(input, Date.now());
  }

  deactivateInput(input: T) {
    this.activeInput.delete(input);
  }

  getKeyPressDurationMs(input: T) {
    if (this.isInputActive(input)) {
      const now = Date.now();
      const startTime = this.activeInput.get(input) || now;
      return now - startTime;
    }
    return -1;
  }

  push(code: T) {
    const { buffer, bufferSize } = this;
    buffer.push(code);
    if (buffer.length > bufferSize) {
      buffer.shift();
    }
    if (this.bufferClearTimeoutId > -1) {
      window.clearTimeout(this.bufferClearTimeoutId);
    }
    this.bufferClearTimeoutId = window.setTimeout(
      this.clearBuffer,
      this.bufferClearTimeoutMs
    );
  }

  clearBuffer = () => {
    this.buffer.length = 0;
    this.bufferClearTimeoutId = -1;
  };

  peek(): T | undefined {
    return this.buffer[this.buffer.length - 1];
  }

  pop() {
    return this.buffer.pop();
  }

  update() {}
}

export class KeyboardInputChannel extends InputChannel<string> {
  onKeyDown(e: KeyboardEvent) {
    const { code } = e;
    const input = this.mapping.get(code) || code;
    this.activateInput(input);
    this.push(input);
    this.emit("keydown", input);
  }

  onKeyUp(e: KeyboardEvent) {
    const { code } = e;
    const input = this.mapping.get(code) || code;
    this.deactivateInput(input);
    this.emit("keyup", input);
  }

  isKeyPressed(code: string) {
    return this.isInputActive(code);
  }

  update() {
    this.activeInput.forEach((_startTime, code) => this.emit("keypress", code));
  }
}

export class RemoteInputChannel extends InputChannel<string> {
  playerInfo: PlayerInfo;
  socket: Socket;

  constructor(
    mapping: Map<string, string>,
    socket: Socket,
    playerInfo: PlayerInfo
  ) {
    super(mapping);
    this.socket = socket;
    this.playerInfo = playerInfo;
    socket
      .on("server.input.keydown", (input: RemoteInput) => {
        if (input.id === playerInfo.id) {
          this.onKeyDown(input.code);
        }
      })
      .on("server.input.keyup", (input: RemoteInput) => {
        if (input.id === playerInfo.id) {
          this.onKeyUp(input.code);
        }
      });
  }

  onKeyDown(keyCode: string) {
    console.log("remote keydown", keyCode);
    const input = this.mapping.get(keyCode) || keyCode;
    this.activateInput(input);
    this.push(input);
  }

  onKeyUp(keyCode: string) {
    console.log("remote keyup", keyCode);
    const input = this.mapping.get(keyCode) || keyCode;
    this.deactivateInput(input);
  }
}

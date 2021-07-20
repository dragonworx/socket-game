import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./game";

const game = Game.instance;

export function GameView() {
  return (
    <div id="gameView-container">
      <div id="gameView"></div>
    </div>
  );
}

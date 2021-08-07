import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./model/game";
import { GameState } from "../common";

const game = Game.instance;

export function Join() {
  const [gameInfo, setGameInfo] = useState(game.state);

  const onClick = () => {
    const input = document.getElementById("player-name") as HTMLInputElement;
    const playerName = input.value.trim();
    if (!playerName.length) {
      const placeholder = input.placeholder;
      input.placeholder = "";
      input.classList.add("error");
      setTimeout(() => {
        input.placeholder = placeholder;
        input.classList.remove("error");
      }, 500);
      return;
    }
    game.join(playerName);
  };

  const onKeyUp = (e: any) => {
    if (e.code === "Enter") {
      onClick();
    }
  };

  useEffect(() => {
    game.on("game.state.changed", (gameState: GameState) => {
      setGameInfo(gameState);
    });
  }, []);

  if (gameInfo.status === "waiting" && !game.userPlayer) {
    return (
      <div id="join-overlay">
        <div id="join">
          <h1>Welcome to Game!</h1>
          <div id="join-input">
            <label>
              Name:{" "}
              <input
                id="player-name"
                type="text"
                onKeyUp={onKeyUp}
                placeholder="Please enter your name"
                autoFocus={true}
              />
            </label>
            <button onClick={onClick}>Join!</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

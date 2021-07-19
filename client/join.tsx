import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./game";
import { getIsAdmin } from "./util";

interface JoinProps {
  game: Game;
}

const isAdmin = getIsAdmin();

export function Join(props: JoinProps) {
  const { game } = props;
  const [gameInfo, setGameInfo] = useState(game.info);

  const onClick = () => {
    const input = document.getElementById("player-name") as HTMLInputElement;
    game.join(input.value);
  };

  useEffect(() => {
    game.on("game.info", (info) => {
      setGameInfo(info);
    });
  }, []);

  if (gameInfo.status === "waiting" && !game.playerName) {
    return (
      <div id="join">
        <div>
          <label>
            Name: <input id="player-name" type="text" />
          </label>
          <button onClick={onClick}>Join!</button>
        </div>
      </div>
    );
  }

  return null;
}

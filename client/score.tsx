import * as React from "react";
import { PlayerInfo } from "../common";
import { Game } from "./model/game";

interface Props {
  player: PlayerInfo;
}

export function Score({ player }: Props) {
  return (
    <div className={"score"}>
      <div className="points">{player.score}</div>
      <div className="health-wrapper">
        <div className="health" style={{ width: `${player.health}%` }}></div>
      </div>
    </div>
  );
}

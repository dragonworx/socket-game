import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./game";
import { getIsAdmin } from "./util";
import { GameStatus, PlayerInfo } from "../common";

const game = Game.instance;

const isAdmin = getIsAdmin();

function getStatusText(status: GameStatus) {
  switch (status) {
    case "unconnected":
      return "Unconnected";
    case "waiting":
      return "Waiting for players";
    case "active":
      return "Game in progres";
    case "over":
      return "Game over";
  }
}

function getPlayerInfoName(player: PlayerInfo) {
  if (player.name) {
    return (
      <span>
        <div className="playerStatusDot active"></div>
        {player.name}
      </span>
    );
  }
  return (
    <span>
      <div className="playerStatusDot"></div>
      {`${player.id}@${player.ip}`}
    </span>
  );
}

export function Info() {
  const [gameInfo, setGameInfo] = useState(game.info);

  const onRemovePlayer = (id: string) => () => {
    game.removePlayer(id);
  };

  useEffect(() => {
    game.on("game.info", (info) => {
      setGameInfo(info);
    });
  }, []);

  const players = gameInfo.players.map((player, i) => {
    const isPlayerJoined = !!player.name;
    if (!isPlayerJoined && !isAdmin) {
      return null;
    }
    return (
      <tr
        key={`info-player-${i}`}
        className={game.socket.id === player.id ? "current" : ""}
      >
        <td>{getPlayerInfoName(player)}</td>
        {isAdmin && player.id !== game.socket.id ? (
          <td>
            <button onClick={onRemovePlayer(player.id)}>-</button>
          </td>
        ) : (
          <td>&nbsp;</td>
        )}
      </tr>
    );
  });

  const onStartGameClick = () => {};

  return (
    <div id="info">
      <div id="status">
        <span>{getStatusText(gameInfo.status)}&#8230;</span>
        {isAdmin ? (
          <button id="start-game" onClick={onStartGameClick}>
            Start Game
          </button>
        ) : null}
      </div>
      <table>
        <thead>
          <tr>
            <th>Players</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{players}</tbody>
      </table>
    </div>
  );
}

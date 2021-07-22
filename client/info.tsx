import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./game";
import { getIsAdmin } from "./util";
import { GameStatus, PlayerInfo, isWaitingGameState } from "../common";

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

function getJoinedPlayers(playerInfo: PlayerInfo[]) {
  return playerInfo.filter((player) => !!player.name);
}

let pingTime: number;
let measureLatency = true;

const ping = () => {
  pingTime = Date.now();
  game.socket.emit("client.ping");
};

export function Info() {
  const [gameState, setGameState] = useState(game.state);
  const [playerInfo, setPlayerInfo] = useState([] as PlayerInfo[]);
  const [latency, setLatency] = useState(0);

  const joinedPlayerCount = getJoinedPlayers(playerInfo).length;

  const onRemovePlayer = (id: string) => () => {
    game.removePlayer(id);
  };

  useEffect(() => {
    game.on("game.state.changed", (gameState) => {
      setGameState(gameState);
      if (isWaitingGameState(gameState)) {
        setPlayerInfo(gameState.players);
      }
    });
    game.on("pong", () => {
      const currentLatency = Math.round((Date.now() - pingTime) / 2);
      setLatency(currentLatency);
      if (measureLatency) {
        ping();
      }
    });
    ping();
  }, []);

  const players = playerInfo.map((player, i) => {
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
            <button
              className="icon recycle"
              onClick={onRemovePlayer(player.id)}
            ></button>
          </td>
        ) : (
          <td>&nbsp;</td>
        )}
      </tr>
    );
  });

  const onStartGameClick = () => {
    game.start();
  };

  const onLatencySwitchChange = () => {
    const checkbox = document.getElementById(
      "latency-switch"
    )! as HTMLInputElement;
    measureLatency = checkbox.checked;
    if (measureLatency) {
      ping();
    }
  };

  return (
    <div id="info">
      <div id="latency">
        <input
          type="checkbox"
          id="latency-switch"
          defaultChecked={true}
          onChange={onLatencySwitchChange}
        />
        {latency}ms
      </div>
      <div id="status">
        <span>{getStatusText(gameState.status)}&#8230;</span>
        {isAdmin ? (
          <button
            id="start-game"
            onClick={onStartGameClick}
            disabled={joinedPlayerCount === 0}
          >
            Start Game
          </button>
        ) : null}
      </div>
      <table>
        <thead>
          <tr>
            <th>Players ({joinedPlayerCount})</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{players}</tbody>
      </table>
    </div>
  );
}

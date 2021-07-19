import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./game";
import { getIsAdmin } from "./util";

interface InfoProps {
  game: Game;
}

const isAdmin = getIsAdmin();

export function Info(props: InfoProps) {
  const { game } = props;
  const [gameInfo, setGameInfo] = useState(game.info);

  const onRemovePlayer = (id: string) => () => {
    game.removePlayer(id);
  };

  useEffect(() => {
    game.on("game.info", (info) => {
      setGameInfo(info);
    });
  }, []);

  const players = gameInfo.players.map((player, i) => (
    <tr
      key={`info-player-${i}`}
      className={game.socket.id === player.id ? "current" : ""}
    >
      <td>{player.name || "?"}</td>
      <td>{player.id}</td>
      <td>{player.ip}</td>
      {isAdmin && player.id !== game.socket.id ? (
        <td>
          <button onClick={onRemovePlayer(player.id)}>-</button>
        </td>
      ) : (
        <td>&nbsp;</td>
      )}
    </tr>
  ));

  return (
    <div id="info">
      <p>{gameInfo.status}</p>
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>id</th>
            <th>ip</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{players}</tbody>
      </table>
    </div>
  );
}

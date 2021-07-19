import * as React from "react";
import { Game } from "./game";
import { Info } from "./info";
import { Join } from "./join";

const game = new Game();

export function App() {
  return (
    <div id="main">
      <Info game={game} />
      <Join game={game} />
    </div>
  );
}

import * as React from "react";
import { Info } from "./info";
import { Join } from "./join";
import { GameView } from "./gameView";

export function App() {
  return (
    <div id="main">
      <GameView />
      <Info />
      <Join />
    </div>
  );
}

import * as React from "react";
import { useState, useEffect } from "react";
import { Game } from "./game";

const game = Game.instance;

const getCSSVar = (element: HTMLElement, varName: string) =>
  parseFloat(getComputedStyle(element).getPropertyValue(varName).trim());

export function GameView() {
  const [canvasBg, setCanvasBg] = useState<HTMLCanvasElement>();
  const [canvasFg, setCanvasFg] = useState<HTMLCanvasElement>();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = document.getElementById("gameView")!;
    const w = getCSSVar(element, "--canvas-width");
    const h = getCSSVar(element, "--canvas-height");
    const canvasBg = document.getElementById("canvas-bg") as HTMLCanvasElement;
    const canvasFg = document.getElementById("canvas-bg") as HTMLCanvasElement;
    canvasBg.width = w;
    canvasBg.height = h;
    canvasFg.width = w;
    canvasFg.height = h;
    setCanvasBg(canvasBg);
    setCanvasFg(canvasFg);
    setWidth(w);
    setHeight(h);

    const ctx = canvasBg.getContext("2d")!;
    ctx.strokeStyle = "white";
    ctx.moveTo(10, 10);
    ctx.lineTo(w - 10, h - 10);
    ctx.stroke();
  }, []);

  return (
    <div id="gameView-container">
      <div id="gameView">
        <canvas id="canvas-bg"></canvas>
        <canvas id="canvas-fg"></canvas>
      </div>
    </div>
  );
}

export type GameStatus = "unconnected" | "waiting" | "active" | "over";

export interface PlayerInfo {
  name?: string;
  id: string;
  ip: string;
}

export interface GameInfo {
  status: GameStatus;
  players: PlayerInfo[];
}

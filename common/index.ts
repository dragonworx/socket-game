export type GameStatus = "unconnected" | "waiting" | "active" | "over";

export interface PlayerInfo {
  name?: string;
  id: string;
  ip: string;
}

export interface ActivePlayer {
  name: string;
  id: string;
  x: number;
  y: number;
}

export interface BasicGameState {
  status: GameStatus;
}

export interface WaitingGameState extends BasicGameState {
  players: PlayerInfo[];
}

export interface ActiveGameState extends BasicGameState {
  players: ActivePlayer[];
}

export type GameState = BasicGameState | WaitingGameState | ActiveGameState;

export const isWaitingGameState = (
  state: GameState
): state is WaitingGameState => state.status === "waiting";

export const isActiveGameState = (state: GameState): state is ActiveGameState =>
  state.status === "active";

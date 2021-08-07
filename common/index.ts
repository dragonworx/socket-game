export type GameStatus = "unconnected" | "waiting" | "active" | "over";
export interface RemoteInput {
  id: string;
  code: string;
}

export interface PlayerInfo {
  id: string;
  name: string;
  ip: string;
  health: number;
  score: number;
  isAlive: boolean;
}

export interface BasicGameState {
  status: GameStatus;
}

export interface WaitingGameState extends BasicGameState {
  players: PlayerInfo[];
}

export interface ActiveGameState extends BasicGameState {
  players: PlayerInfo[];
}

export type GameState = BasicGameState | WaitingGameState | ActiveGameState;

export const isWaitingGameState = (
  state: GameState
): state is WaitingGameState => state.status === "waiting";

export const isActiveGameState = (state: GameState): state is ActiveGameState =>
  state.status === "active";

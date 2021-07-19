import { Player } from './player';

export class Game {
  static games: Map<string, Game> = new Map();

  id: string;
  players: Player[];

  constructor(id: string) {
    if (Game.games.has(id)) {
      throw new Error(`Game with id "${id} already exists`);
    }

    this.id = id;
    this.players = [];

    Game.games.set(id, this);
  }
}

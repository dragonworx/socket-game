export class Game {
  static games: Map<string, Game> = new Map();

  id: string;

  constructor(id: string) {
    this.id = id;
    if (Game.games.has(id)) {
      throw new Error(`Game with id "${id} already exists`);
    }
    Game.games.set(id, this);
  }
}

export class Player {
  name?: string;
  state: "waiting" | "joined" | "active" | "dead";

  constructor() {
    this.state = "waiting";
  }
}

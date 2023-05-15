export default class Player {
  ready = false;
  name: string;
  playerId: string;

  constructor(name: string, playerId: string) {
    this.name = name;
    this.playerId = playerId;
  }
}

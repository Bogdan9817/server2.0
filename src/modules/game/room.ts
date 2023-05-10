import { Player } from './game.gateway';

export type CardsOptions = { [key: string]: boolean };
export type Session = 'public' | 'private';

export class Room {
  cardOpts: CardsOptions;
  type: Session;
  playersLimit: number;
  id: string;

  players: Player[] = [];
  isStarts = false;
  constructor(opts: CardsOptions, type: Session, limit: number, id: string) {
    this.cardOpts = opts;
    this.type = type;
    (this.playersLimit = limit), (this.id = id);
  }
}

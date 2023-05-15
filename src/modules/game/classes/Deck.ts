export type Card = {
  text: string;
  id: string;
};
export type JudgeCard = Card & { author: string };

export class Deck {
  cards: Card[];
  private _empty: boolean = null;
  constructor(cards: Card[]) {
    this.cards = this.shuffleCards(cards);
  }

  private shuffleCards(cards: Card[]) {
    return cards.sort(() => Math.random() - 0.5);
  }

  takeSomeCardsFromEnd(nth: number) {
    if (this.cards.length < nth) {
      this._empty = true;
    }
    const takenCards: Card[] = [];
    for (let i = 0; i < nth; i++) {
      takenCards.push(this.cards.pop());
    }
    return takenCards;
  }

  pop() {
    if (this.cards.length === 0) {
      this._empty = true;
    }
    return this.cards.pop();
  }

  get empty() {
    return this._empty;
  }
}

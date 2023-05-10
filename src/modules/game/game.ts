import { Player } from './game.gateway';

const CARDS_LIMIT = 6;

export type Card = {
  text: string;
  id: string;
};
type JudgeCard = Card & { author: string };

interface PlayersObj {
  [key: string]: Card[];
}

interface GamePlayer {
  name: string;
  playerId: string;
  result: number;
}

export class Game {
  currentJudgeAnswers: JudgeCard[] = [];
  players: GamePlayer[] = [];
  currentQuestion: Card = null;

  currentJudge = -1;
  playersObj: PlayersObj = {};

  private _questionsDeck: Deck;
  private _answersDeck: Deck;
  private _over: boolean = null;

  constructor(players: Player[], answerCards: Card[], questionsCards: Card[]) {
    this._questionsDeck = new Deck(questionsCards);
    this._answersDeck = new Deck(answerCards);
    players.forEach(({ name, playerId }) => {
      this.players.push({ name, playerId, result: 0 });
      this.playersObj[playerId] =
        this._answersDeck.takeSomeCardsFromEnd(CARDS_LIMIT);
    });
  }

  startRound() {
    this.updateQuestionCard();
    this.updateAnswersCard();
    this.updateJudge();
  }

  private updateQuestionCard() {
    this.currentQuestion = this._questionsDeck.pop();
    if (!this.currentQuestion) this._over = true;
  }

  private updateAnswersCard() {
    for (let key in this.playersObj) {
      const need = CARDS_LIMIT - this.playersObj[key].length;
      this.playersObj[key] = this.playersObj[key].concat(
        this._answersDeck.takeSomeCardsFromEnd(need),
      );
      if (this._answersDeck.empty) {
        return (this._over = true);
      }
    }
  }

  private updateJudge() {
    this.currentJudgeAnswers = [];
    this.currentJudge++;
    if (this.currentJudge === this.players.length) {
      this.currentJudge = 0;
    }
  }

  playerChooseCard(playerId: string, card: Card) {
    this.playersObj[playerId] = this.playersObj[playerId].filter(
      (c: Card) => c.id !== card.id,
    );
    this.currentJudgeAnswers.push({ ...card, author: playerId });
  }

  judgeChooseCard(authorId: string) {
    this.players = this.players.map((player) => {
      if (player.playerId === authorId) player.result += 1;
      return player;
    });
  }

  playerLeaveGame(playerId: string) {
    this.players = this.players.filter((p) => p.playerId !== playerId);
    delete this.playersObj[playerId];
  }

  get over() {
    return this._over;
  }
}

class Deck {
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

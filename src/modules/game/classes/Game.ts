import { Card, Deck, JudgeCard } from './Deck';
import Player from './Player';

const CARDS_LIMIT = 6;

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
  playersObj: PlayersObj = {};

  private _players: GamePlayer[] = [];
  private _currentJudge = -1;
  private _questionsDeck: Deck;
  private _answersDeck: Deck;
  private _over: boolean = null;
  private _gameId: string;
  private _currentQuestion: Card = null;

  constructor(
    players: Player[],
    answerCards: Card[],
    questionsCards: Card[],
    id: string,
  ) {
    this._questionsDeck = new Deck(questionsCards);
    this._answersDeck = new Deck(answerCards);
    this._gameId = id;
    players.forEach(({ name, playerId }) => {
      this._players.push({ name, playerId, result: 0 });
      this.playersObj[playerId] =
        this._answersDeck.takeSomeCardsFromEnd(CARDS_LIMIT);
    });
  }

  startRound() {
    this.updateQuestionCard();
    this.updateAnswersCard();
    this.updateJudge();
  }

  playerChooseCard(playerId: string, card: Card) {
    this.playersObj[playerId] = this.playersObj[playerId].filter(
      (c: Card) => c.id !== card.id,
    );
    this.currentJudgeAnswers.push({ ...card, author: playerId });
  }

  judgeChooseCard(authorId: string) {
    this._players = this._players.map((player) => {
      if (player.playerId === authorId) player.result++;
      return player;
    });
  }

  playerLeaveGame(playerId: string) {
    const isJudge = this.isJudge(playerId);
    this._players = this._players.filter((p) => p.playerId !== playerId);
    delete this.playersObj[playerId];
    if (this._players.length < this.judge) this._currentJudge--;
    if (this._players.length < this.judge && isJudge) this.updateJudgeNum();
    if (this._players.length < 3) this._over = true;
  }

  private updateQuestionCard() {
    this._currentQuestion = this._questionsDeck.pop();
    if (!this._currentQuestion) this._over = true;
  }

  private updateAnswersCard() {
    for (let key in this.playersObj) {
      const need = CARDS_LIMIT - this.playersObj[key].length;
      this.playersObj[key] = this.playersObj[key].concat(
        this._answersDeck.takeSomeCardsFromEnd(need),
      );
      if (this._answersDeck.empty) return (this._over = true);
    }
  }

  private updateJudge() {
    this.currentJudgeAnswers = [];
    this.updateJudgeNum();
  }

  private updateJudgeNum() {
    this._currentJudge++;
    if (this._currentJudge === this._players.length) this._currentJudge = 0;
  }

  private isJudge(playerId: string): boolean {
    return this.players[this.judge].playerId === playerId;
  }

  get question() {
    return this._currentQuestion;
  }

  get judge() {
    return this._currentJudge;
  }

  get players() {
    return this._players;
  }

  get over() {
    return this._over;
  }

  get id() {
    return this._gameId;
  }
}

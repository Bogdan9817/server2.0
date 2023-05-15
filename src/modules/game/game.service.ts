import { Injectable } from '@nestjs/common';
import { RoomService } from './room.service';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionCard } from 'src/schemas/question-card.schema';
import { Model } from 'mongoose';
import { AnswerCard } from 'src/schemas/answer-card.schema';
import { Game } from './classes/Game';
import { Card } from './classes/Deck';
import Player from './classes/Player';

@Injectable()
export class GameService {
  private games: Map<string, Game> = new Map();
  constructor(
    private roomService: RoomService,
    @InjectModel(QuestionCard.name) private questions: Model<QuestionCard>,
    @InjectModel(AnswerCard.name) private answers: Model<AnswerCard>,
  ) {}

  async gameInit(socket: Socket, server: Server) {
    const { players, cardOpts, id } = this.getGameRoom(socket);
    server.to(id).emit('load_trigger', true);
    if (!this.isAccessed(socket, players)) {
      return server.to(id).emit('load_trigger', false);
    }
    const answerCards = await this.answers.find();
    const questionCards = await this.questions.find();
    const game = new Game(players, answerCards, questionCards, id);
    this.games.set(id, game);
    server.to(id).emit('load_trigger', false);
  }

  gameStart(socket: Socket, server: Server) {
    const { isStarts } = this.getGameRoom(socket);
    if (!isStarts) return;
    const game = this.getGame(socket);
    this.roundStart(server, game);
  }

  playerChooseAnswer(socket: Socket, server: Server, card: Card) {
    const game = this.getGame(socket);
    game.playerChooseCard(socket.id, card);
    if (game.currentJudgeAnswers.length === game.players.length - 1) {
      server.to(game.id).emit('round_answers', game.currentJudgeAnswers);
    }
  }

  judgeChooseAnswer(socket: Socket, server: Server, authorId: string) {
    const game = this.getGame(socket);
    game.judgeChooseCard(authorId);
    this.roundStart(server, game);
  }

  leaveGame(socket: Socket, server: Server) {
    const game = this.getGame(socket);
    if (!game) return;
    console.log('player leave');
    game.playerLeaveGame(socket.id);
    if (game.over) return server.to(game.id).emit('game_over', game.players);
    server.to(game.id).emit('current_judge', game.players[game.judge].name);
    server.to(game.id).emit('players_update', game.players);
  }

  private roundStart(server: Server, game: Game) {
    game.startRound();
    if (game.over) return server.to(game.id).emit('game_over', game.players);
    server.to(game.id).emit('question_card_update', game.question);
    server.to(game.id).emit('current_judge', game.players[game.judge].name);
    server.to(game.id).emit('players_update', game.players);
    for (let player in game.playersObj) {
      server.to(player).emit('answer_cards_update', game.playersObj[player]);
    }
  }

  private getGameRoom(socket: Socket) {
    const id = this.getId(socket);
    return this.roomService.rooms.get(id);
  }

  private getId(socket: Socket): string {
    return this.roomService.playerInRoom.get(socket);
  }

  private getGame(socket: Socket): Game {
    const gameId = this.getId(socket);
    return this.games.get(gameId);
  }

  private isAccessed(socket: Socket, players: Player[]) {
    if (players.some((p) => !p.ready)) {
      socket.emit('game_alert', 'Схоже що не всі готові!');
      return false;
    }
    if (players.length < 3) {
      socket.emit('game_alert', 'Надто мало гравців');
      return false;
    }
    return true;
  }
}

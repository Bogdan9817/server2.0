import { Injectable } from '@nestjs/common';
import { RoomService } from './room.service';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { QuestionCard } from 'src/schemas/question-card.schema';
import { Model } from 'mongoose';
import { AnswerCard } from 'src/schemas/answer-card.schema';
import { Card, Game } from './game';
import { Player } from './game.gateway';

interface Games {
  [key: string]: Game;
}

@Injectable()
export class GameService {
  games: Games = {};

  constructor(
    private roomService: RoomService,
    @InjectModel(QuestionCard.name) private questions: Model<QuestionCard>,
    @InjectModel(AnswerCard.name) private answers: Model<AnswerCard>,
  ) {}

  async gameInit(socket: Socket, server: Server) {
    const { players, cardOpts, id } = this.getGameRoom(socket);
    if (!this.isAccessed(socket, players)) return;

    const answerCards = await this.answers.find();
    const questionCards = await this.questions.find();

    this.games[id] = new Game(players, answerCards, questionCards);
  }

  roundStart(socket: Socket, server: Server) {
    const { isStarts, id } = this.getGameRoom(socket);
    if (!isStarts) return;
    const game = this.getGame(socket);
    game.startRound();
    const { playersObj, currentQuestion, currentJudge, players } = game;
    const updateData = { currentQuestion, currentJudge, players };
    server.to(id).emit('players_update', updateData);
    server.to(id).emit('question_card_update', currentQuestion);
    for (let player in playersObj) {
      server.to(player).emit('answer_cards_update', playersObj[player]);
    }
  }

  playerChooseAnswer(socket: Socket, server: Server, card: Card) {
    const id = this.getId(socket);
    const game = this.getGame(socket);
    game.playerChooseCard(socket.id, card);
    if (game.currentJudgeAnswers.length === game.players.length - 1) {
      server.to(id).emit('round_answers', game.currentJudgeAnswers);
    }
  }

  judgeChooseAnswer(socket: Socket, server: Server, authorId: string) {
    const game = this.getGame(socket);
    game.judgeChooseCard(authorId);
    this.roundStart(socket, server);
  }

  leaveGame(socket: Socket, server: Server) {
    const game = this.getGame(socket);
    if (!game) return;
    console.log('player leave');
    game.playerLeaveGame(socket.id);
    this.roundStart(socket, server);
  }

  private getGameRoom(socket: Socket) {
    const id = this.getId(socket);
    return this.roomService.rooms[id];
  }

  private getId(socket: Socket) {
    return [...socket.rooms][1];
  }

  private getGame(socket: Socket) {
    const gameId = this.getId(socket);
    return this.games[gameId];
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

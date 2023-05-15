import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { CreateRoomArgs, RoomService } from './room.service';
import { Card } from './classes/Deck';

require('dotenv').config();

@WebSocketGateway({ cors: true })
export class GameGateway {
  constructor(
    private gameService: GameService,
    private roomService: RoomService,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: CreateRoomArgs,
  ) {
    const roomId = this.roomService.createRoom(body);
    this.server.to(socket.id).emit('get_roomId', roomId);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { name: string; roomId: string },
  ) {
    this.roomService.joinRoom(socket, this.server, { ...body });
  }

  @SubscribeMessage('player_ready')
  handlePlayerReady(@ConnectedSocket() socket: Socket) {
    this.roomService.updatePlayerReady(socket, this.server);
  }

  @SubscribeMessage('game_init')
  async handleGameInit(@ConnectedSocket() socket: Socket) {
    await this.gameService.gameInit(socket, this.server);
    this.roomService.closeRoom(socket);
    this.gameService.gameStart(socket, this.server);
  }

  @SubscribeMessage('player_choose_answer')
  handlePlayerChooseAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() card: Card,
  ) {
    this.gameService.playerChooseAnswer(socket, this.server, card);
  }

  @SubscribeMessage('judge_choose_answer')
  handleJudgeChooseAnswer(
    @ConnectedSocket() socket: Socket,
    @MessageBody() authorId: string,
  ) {
    this.gameService.judgeChooseAnswer(socket, this.server, authorId);
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.gameService.leaveGame(socket, this.server);
    this.roomService.playerLeftRoom(socket);
  }
}

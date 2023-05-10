import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { CardsOptions, Room, Session } from './room';

export interface CreateRoomArgs {
  playersLimit: number;
  sessionType: Session;
  sessionCardsOpts: CardsOptions;
}

@Injectable()
export class RoomService {
  rooms: { [key: string]: Room } = {};
  constructor() {}

  createRoom({ playersLimit, sessionType, sessionCardsOpts }) {
    const roomId = this.generateId();
    const room = new Room(sessionCardsOpts, sessionType, playersLimit, roomId);
    this.rooms[roomId] = room;
    console.log(`Room ${roomId} - created`);
    return roomId;
  }

  joinRoom(socket: Socket, server: Server, { name, roomId }) {
    socket.leave(this.getCurrentRoom(socket)?.id);
    if (!this.isAccessed(socket, roomId)) return;
    socket.join(roomId);
    const player = { name, playerId: socket.id, ready: false };
    this.rooms[roomId].players.push(player);
    server.to(roomId).emit('player_joined', this.rooms[roomId].players);
    console.log(`Player ${name} joined ${roomId} - room`);
  }

  updatePlayerReady(socket: Socket, server: Server) {
    const room = this.getCurrentRoom(socket);
    room.players.forEach((p) => {
      if (p.playerId === socket.id) p.ready = true;
      return p;
    });
    server
      .to(room.id)
      .emit('player_updates_ready_state', this.rooms[room.id].players);
  }

  closeRoom(socket: Socket) {
    const room = this.getCurrentRoom(socket);
    if (this.rooms[room.id].players.some((p) => !p.ready)) return;
    if (this.rooms[room.id].players.length < 3) return;
    this.rooms[room.id].isStarts = true;
  }

  private generateId(): string {
    const id = uuidv4();
    if (this.rooms[id]) {
      return this.generateId();
    }
    return id;
  }

  private getCurrentRoom(socket: Socket) {
    return this.rooms[[...socket.rooms][1]];
  }

  private isAccessed(socket: Socket, roomId: string) {
    // CHECK IF ROOM EXISTS
    if (!this.rooms[roomId]) {
      socket.emit('socket_alert', "Room doesn't exist");
      return false;
    }
    // CHECK IF GAME STARTS
    if (this.rooms[roomId].isStarts) {
      socket.emit('socket_alert', 'Game already started!');
      return false;
    }
    // CHECK IF ROOM IS FULL
    if (this.rooms[roomId].playersLimit <= this.rooms[roomId].players.length) {
      socket.emit('socket_alert', 'Room is full!');
      return false;
    }
    // OTHERWISE RETURN TRUE
    return true;
  }
}

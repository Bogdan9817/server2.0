import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Server, Socket } from 'socket.io';
import { CardsOptions, Room, Session } from './classes/Room';

import Player from './classes/Player';

export interface CreateRoomArgs {
  playersLimit: number;
  sessionType: Session;
  sessionCardsOpts: CardsOptions;
}

@Injectable()
export class RoomService {
  rooms: Map<string, Room> = new Map();
  playerInRoom: Map<Socket, string> = new Map();
  constructor() {}

  createRoom({ playersLimit, sessionType, sessionCardsOpts }): string {
    const roomId = this.generateId();
    const room = new Room(sessionCardsOpts, sessionType, playersLimit, roomId);
    this.rooms.set(roomId, room);
    console.log(`Room ${roomId} - created`);
    return roomId;
  }

  joinRoom(socket: Socket, server: Server, { name, roomId }): void {
    socket.leave(this.getCurrentRoom(socket)?.id);
    if (!this.isAccessed(socket, roomId)) return;
    socket.join(roomId);
    this.playerInRoom.set(socket, roomId);
    const player = new Player(name, socket.id);
    this.rooms.get(roomId).players.push(player);
    server.to(roomId).emit('player_joined', this.rooms.get(roomId).players);
    console.log(`Player ${name} joined ${roomId} - room`);
  }

  updatePlayerReady(socket: Socket, server: Server): void {
    const room = this.getCurrentRoom(socket);
    room.players.forEach((p: Player) => {
      if (p.playerId === socket.id) p.ready = true;
      return p;
    });
    server.to(room.id).emit('player_updates_ready_state', room.players);
  }

  closeRoom(socket: Socket): void {
    const room = this.getCurrentRoom(socket);
    if (room.players.some((p: Player) => !p.ready)) return;
    if (room.players.length < 3) return;
    room.isStarts = true;
  }

  playerLeftRoom(socket: Socket): void {
    const room = this.getCurrentRoom(socket);
    if (!room) return;
    room.players = room.players.filter((p: Player) => p.playerId !== socket.id);
    if (!room.players.length) this.rooms.delete(room.id);
    this.playerInRoom.delete(socket);
  }

  private isAccessed(socket: Socket, roomId: string): boolean {
    // CHECK IF ROOM EXISTS
    if (!this.rooms.get(roomId)) {
      socket.emit('socket_alert', "Room doesn't exist");
      return false;
    }
    // CHECK IF GAME STARTS
    if (this.rooms.get(roomId).isStarts) {
      socket.emit('socket_alert', 'Game already started!');
      return false;
    }
    // CHECK IF ROOM IS FULL
    if (
      this.rooms.get(roomId).playersLimit <=
      this.rooms.get(roomId).players.length
    ) {
      socket.emit('socket_alert', 'Room is full!');
      return false;
    }
    // OTHERWISE RETURN TRUE
    return true;
  }

  private generateId(): string {
    const id = uuidv4();
    if (this.rooms[id]) {
      return this.generateId();
    }
    return id;
  }

  private getCurrentRoom(socket: Socket): Room {
    const room = this.playerInRoom.get(socket);
    return this.rooms.get(room);
  }
}

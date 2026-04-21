import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface CreateRoomRequestDto {
  activityId: string;
  participantIds: string[];
}

export interface CreateRoomResponseDto {
  roomId: string;
}

export interface ChatClient {
  createRoom(req: CreateRoomRequestDto): Promise<CreateRoomResponseDto>;
  addParticipant(roomId: string, userId: string): Promise<void>;
  removeParticipant(roomId: string, userId: string): Promise<void>;
}

export const CHAT_CLIENT = Symbol('ChatClient');

@Injectable()
export class MockChatClient implements ChatClient {
  async createRoom(_req: CreateRoomRequestDto): Promise<CreateRoomResponseDto> {
    return { roomId: randomUUID() };
  }
  async addParticipant(_roomId: string, _userId: string): Promise<void> {
    return;
  }
  async removeParticipant(_roomId: string, _userId: string): Promise<void> {
    return;
  }
}

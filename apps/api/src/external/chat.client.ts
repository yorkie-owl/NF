import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type {
  ChatClient as ContractChatClient,
  ChatLastMessage,
  CreateRoomRequest,
  CreateRoomResponse,
} from '@lin-shi/contracts';

export type ChatClient = ContractChatClient;

export const CHAT_CLIENT = Symbol('ChatClient');

/**
 * Mock for E (chat) module. Returns a random roomId and no-ops all other
 * methods. `getLastMessage` returns null so C falls back to the most recent
 * system activity_event as the feed preview.
 */
@Injectable()
export class MockChatClient implements ChatClient {
  async createRoom(_req: CreateRoomRequest): Promise<CreateRoomResponse> {
    return { roomId: randomUUID() };
  }
  async addParticipant(_roomId: string, _userId: string): Promise<void> {
    return;
  }
  async removeParticipant(_roomId: string, _userId: string): Promise<void> {
    return;
  }
  async getLastMessage(_roomId: string): Promise<ChatLastMessage | null> {
    return null;
  }
  async countUnread(
    _roomId: string,
    _since: string | null,
  ): Promise<number> {
    return 0;
  }
}

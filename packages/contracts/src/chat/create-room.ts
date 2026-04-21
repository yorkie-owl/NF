import { z } from 'zod';

export const CreateRoomRequestSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()).min(2),
});
export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;

export const CreateRoomResponseSchema = z.object({
  roomId: z.string().uuid(),
});
export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

export const ChatLastMessageSchema = z.object({
  roomId: z.string().uuid(),
  type: z.enum(['CHAT', 'SYSTEM']),
  preview: z.string(),
  senderNickname: z.string().nullable(),
  at: z.string().datetime(),
});
export type ChatLastMessage = z.infer<typeof ChatLastMessageSchema>;

export interface ChatClient {
  createRoom(req: CreateRoomRequest): Promise<CreateRoomResponse>;
  addParticipant(roomId: string, userId: string): Promise<void>;
  removeParticipant(roomId: string, userId: string): Promise<void>;
  getLastMessage(roomId: string): Promise<ChatLastMessage | null>;
  countUnread(roomId: string, since: string | null): Promise<number>;
}

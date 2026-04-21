import { z } from 'zod';

export const CreateRoomRequestSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()).min(2),
});

export const CreateRoomResponseSchema = z.object({
  roomId: z.string().uuid(),
});

export type CreateRoomRequest = z.infer<typeof CreateRoomRequestSchema>;
export type CreateRoomResponse = z.infer<typeof CreateRoomResponseSchema>;

export interface ChatClient {
  createRoom(req: CreateRoomRequest): Promise<CreateRoomResponse>;
  addParticipant(roomId: string, userId: string): Promise<void>;
  removeParticipant(roomId: string, userId: string): Promise<void>;
}

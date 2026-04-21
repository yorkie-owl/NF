import { z } from 'zod';
import { ActivityStatusEnum, ActivityJoinScopeEnum } from '../enums';

export const ActivityParticipantSchema = z.object({
  userId: z.string().uuid(),
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
});

export const ActivityIngredientSchema = z.object({
  ingredientId: z.string().uuid(),
  addedBy: z.string().uuid(),
  addedAt: z.string().datetime(),
});

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(80),
  description: z.string().max(500).nullable(),
  startTime: z.string().datetime(),
  location: z.string().min(1).max(200),
  maxParticipants: z.number().int().min(2).max(10),
  joinScope: ActivityJoinScopeEnum,
  status: ActivityStatusEnum,
  createdBy: z.string().uuid(),
  chatRoomId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  participantCount: z.number().int().nonnegative(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const ActivityDetailSchema = ActivitySchema.extend({
  participants: z.array(ActivityParticipantSchema),
  ingredients: z.array(ActivityIngredientSchema),
});
export type ActivityDetail = z.infer<typeof ActivityDetailSchema>;

import { z } from 'zod';
import { ActivityJoinScopeEnum, ActivityStatusEnum } from '../enums';

export const ActivityParticipantSchema = z.object({
  userId: z.string().uuid(),
  nickname: z.string(),
  avatarUrl: z.string().url().nullable(),
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
});
export type ActivityParticipant = z.infer<typeof ActivityParticipantSchema>;

export const ActivityIngredientSchema = z.object({
  ingredientId: z.string().uuid(),
  addedBy: z.string().uuid(),
  addedAt: z.string().datetime(),
});
export type ActivityIngredient = z.infer<typeof ActivityIngredientSchema>;

export const ActivityManualIngredientSchema = z.object({
  name: z.string().min(1).max(50),
  addedBy: z.string().uuid(),
  addedAt: z.string().datetime(),
});
export type ActivityManualIngredient = z.infer<
  typeof ActivityManualIngredientSchema
>;

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
  manualIngredients: z.array(ActivityManualIngredientSchema),
});
export type ActivityDetail = z.infer<typeof ActivityDetailSchema>;

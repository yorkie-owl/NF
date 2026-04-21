import { z } from 'zod';
import { ActivityJoinScopeEnum } from '../enums';

export const CreateActivityRequestSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  startTime: z.string().datetime(),
  location: z.string().min(1).max(200),
  maxParticipants: z.number().int().min(2).max(10),
  joinScope: ActivityJoinScopeEnum,
  ingredientIds: z.array(z.string().uuid()).max(20).default([]),
  manualIngredients: z.array(z.string().min(1).max(50)).max(20).default([]),
});
export type CreateActivityRequest = z.infer<typeof CreateActivityRequestSchema>;

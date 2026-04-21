import { z } from 'zod';

export const UserBadgeSchema = z.object({
  code: z.string(),
  earnedAt: z.string().datetime(),
});
export type UserBadge = z.infer<typeof UserBadgeSchema>;

import { z } from 'zod';

export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  avatarUrl: z.string().url().nullable(),
  school: z.string().nullable(),
  city: z.string().nullable(),
  bio: z.string().nullable(),
  badges: z.array(z.string()),
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const UserPrivateSchema = UserPublicSchema.extend({
  email: z.string().email(),
  credit: z.number().int().min(0).max(100).nullable(),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
});
export type UserPrivate = z.infer<typeof UserPrivateSchema>;

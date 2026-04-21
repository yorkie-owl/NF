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
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
});
export type UserPrivate = z.infer<typeof UserPrivateSchema>;

export const UpdateProfileRequestSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  school: z.string().max(100).nullable().optional(),
  city: z.string().max(50).nullable().optional(),
  bio: z.string().max(140).nullable().optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

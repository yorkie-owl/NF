import { z } from 'zod';

export const UpdateProfileRequestSchema = z
  .object({
    nickname: z.string().min(1).max(20).optional(),
    avatarUrl: z.string().url().max(500).nullable().optional(),
    school: z.string().max(100).nullable().optional(),
    city: z.string().max(50).nullable().optional(),
    bio: z.string().max(140).nullable().optional(),
  })
  .strict();
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const AvatarUploadResponseSchema = z.object({
  avatarUrl: z.string().url(),
});
export type AvatarUploadResponse = z.infer<typeof AvatarUploadResponseSchema>;

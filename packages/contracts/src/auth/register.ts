import { z } from 'zod';

export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
  nickname: z.string().min(1).max(20),
  inviteCode: z.string().length(8),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

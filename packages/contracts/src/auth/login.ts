import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(64),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

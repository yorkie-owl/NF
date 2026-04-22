import { z } from 'zod';
import { UserPrivateSchema } from '../users/user';
import { AuthTokensSchema } from './tokens';

export const INVITE_CODE_REGEX = /^[0-9A-HJKMNP-TV-Z]{8}$/;

export const RegisterRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(64),
  nickname: z.string().min(1).max(20),
  inviteCode: z.string().length(8).regex(INVITE_CODE_REGEX),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const AuthResponseSchema = z.object({
  tokens: AuthTokensSchema,
  user: UserPrivateSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

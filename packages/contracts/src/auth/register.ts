import { z } from 'zod';
import { UserPrivateSchema } from '../users/user';

/**
 * Invite code format: `LINSH-XXXX`
 *   - fixed prefix "LINSH-"
 *   - 4 chars Crockford Base32 (0-9 A-Z, excluding I/L/O/U)
 *   - total length 10
 */
export const INVITE_CODE_REGEX = /^LINSH-[0-9A-HJKMNP-TV-Z]{4}$/;

export const RegisterRequestSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(64),
  nickname: z.string().min(1).max(20),
  inviteCode: z.string().length(10).regex(INVITE_CODE_REGEX),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresAt: z.string().datetime(),
  refreshExpiresAt: z.string().datetime(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const AuthResponseSchema = z.object({
  tokens: AuthTokensSchema,
  user: UserPrivateSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

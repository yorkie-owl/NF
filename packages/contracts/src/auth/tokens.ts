import { z } from 'zod';

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresAt: z.string().datetime(),
  refreshExpiresAt: z.string().datetime(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

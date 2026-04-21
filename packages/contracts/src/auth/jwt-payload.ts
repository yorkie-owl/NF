import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  iat: z.number(),
  exp: z.number(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

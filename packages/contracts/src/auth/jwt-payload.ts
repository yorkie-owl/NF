import { z } from 'zod';

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  iat: z.number().int(),
  exp: z.number().int(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

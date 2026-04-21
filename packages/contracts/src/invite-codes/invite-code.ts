import { z } from 'zod';

export const InviteCodeSchema = z.object({
  code: z.string().length(8),
  isConsumed: z.boolean(),
  consumedAt: z.string().datetime().nullable(),
});
export type InviteCode = z.infer<typeof InviteCodeSchema>;

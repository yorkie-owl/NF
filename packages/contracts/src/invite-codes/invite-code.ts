import { z } from 'zod';

export const InviteCodeRedemptionSchema = z.object({
  userId: z.string().uuid(),
  nickname: z.string(),
  redeemedAt: z.string().datetime(),
});
export type InviteCodeRedemption = z.infer<typeof InviteCodeRedemptionSchema>;

export const InviteCodeDetailSchema = z.object({
  code: z.string().length(10),
  maxUses: z.number().int().positive(),
  usesRemaining: z.number().int().nonnegative(),
  redemptions: z.array(InviteCodeRedemptionSchema),
});
export type InviteCodeDetail = z.infer<typeof InviteCodeDetailSchema>;

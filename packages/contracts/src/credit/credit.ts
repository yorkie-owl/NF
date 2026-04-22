import { z } from 'zod';

export const CreditScoreSchema = z.object({
  userId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  updatedAt: z.string().datetime(),
});
export type CreditScore = z.infer<typeof CreditScoreSchema>;

export interface CreditClient {
  getUserCredit(userId: string): Promise<CreditScore>;
  getBatch(userIds: string[]): Promise<CreditScore[]>;
}

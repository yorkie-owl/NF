import { z } from 'zod';
import { ActivitySchema } from '../activities/activity';

export const MatchedActivitySchema = ActivitySchema.extend({
  matchScore: z.number().min(0).max(1),
  reason: z.string(),
});
export type MatchedActivity = z.infer<typeof MatchedActivitySchema>;

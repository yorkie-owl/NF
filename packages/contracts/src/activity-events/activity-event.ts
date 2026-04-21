import { z } from 'zod';
import { ActivityEventTypeEnum } from '../enums';

export const ActivityEventSchema = z.object({
  id: z.string().uuid(),
  activityId: z.string().uuid(),
  type: ActivityEventTypeEnum,
  actorId: z.string().uuid().nullable(),
  payload: z.record(z.unknown()),
  createdAt: z.string().datetime(),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

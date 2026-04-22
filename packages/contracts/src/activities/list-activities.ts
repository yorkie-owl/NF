import { z } from 'zod';
import { PaginationQuerySchema } from '../common/pagination';
import { ActivityJoinScopeEnum, ActivityStatusEnum } from '../enums';

const ListStatusSchema = z.union([
  ActivityStatusEnum,
  z.array(ActivityStatusEnum),
]);

export const ListActivitiesQuerySchema = PaginationQuerySchema.extend({
  status: z
    .preprocess((raw) => {
      if (typeof raw !== 'string') return raw;
      return raw.includes(',') ? raw.split(',').map((s) => s.trim()) : raw;
    }, ListStatusSchema)
    .optional(),
  joinScope: ActivityJoinScopeEnum.optional(),
  scope: z.enum(['mine', 'all']).default('all'),
  createdBy: z.string().uuid().optional(),
  joinedBy: z.string().uuid().optional(),
  minParticipants: z.coerce.number().int().min(2).max(10).optional(),
  maxParticipants: z.coerce.number().int().min(2).max(10).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export type ListActivitiesQuery = z.infer<typeof ListActivitiesQuerySchema>;

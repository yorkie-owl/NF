import { z } from 'zod';
import { PaginationQuerySchema } from '../common/pagination';
import { ActivityStatusEnum, ActivityJoinScopeEnum } from '../enums';

export const ListActivitiesQuerySchema = PaginationQuerySchema.extend({
  status: z.union([ActivityStatusEnum, z.array(ActivityStatusEnum)]).optional(),
  joinScope: ActivityJoinScopeEnum.optional(),
  createdBy: z.string().uuid().optional(),
  joinedBy: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export type ListActivitiesQuery = z.infer<typeof ListActivitiesQuerySchema>;

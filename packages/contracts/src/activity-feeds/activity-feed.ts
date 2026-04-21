import { z } from 'zod';
import { PaginationQuerySchema } from '../common/pagination';
import { ActivityStatusEnum } from '../enums';

export const ActivityFeedLastMessageSchema = z.object({
  type: z.enum(['CHAT', 'SYSTEM']),
  preview: z.string(),
  senderNickname: z.string().nullable(),
  unreadCount: z.number().int().nonnegative(),
  at: z.string().datetime(),
});
export type ActivityFeedLastMessage = z.infer<
  typeof ActivityFeedLastMessageSchema
>;

export const ActivityFeedItemSchema = z.object({
  activityId: z.string().uuid(),
  activityTitle: z.string(),
  activityEmoji: z.string(),
  activityStatus: ActivityStatusEnum,
  lastMessage: ActivityFeedLastMessageSchema.nullable(),
  updatedAt: z.string().datetime(),
});
export type ActivityFeedItem = z.infer<typeof ActivityFeedItemSchema>;

export const ActivityFeedFilterEnum = z.enum([
  'ALL',
  'UNREAD',
  'IN_PROGRESS',
  'STARTING_SOON',
]);
export type ActivityFeedFilter = z.infer<typeof ActivityFeedFilterEnum>;

export const ListActivityFeedsQuerySchema = PaginationQuerySchema.extend({
  status: ActivityFeedFilterEnum.default('ALL'),
});
export type ListActivityFeedsQuery = z.infer<
  typeof ListActivityFeedsQuerySchema
>;

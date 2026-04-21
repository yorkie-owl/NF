import { z } from 'zod';
import { ActivityStatusEnum } from '../enums';

export const ACTIVITY_EVENTS = {
  CREATED: 'activity.created',
  JOINED: 'activity.joined',
  LEFT: 'activity.left',
  FORMED: 'activity.formed',
  CANCELLED: 'activity.cancelled',
  ENDED: 'activity.ended',
  STATUS_CHANGED: 'activity.status_changed',
} as const;

export const ActivityCreatedEventSchema = z.object({
  activityId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type ActivityCreatedEvent = z.infer<typeof ActivityCreatedEventSchema>;

export const ActivityJoinedEventSchema = z.object({
  activityId: z.string().uuid(),
  userId: z.string().uuid(),
  joinedAt: z.string().datetime(),
});
export type ActivityJoinedEvent = z.infer<typeof ActivityJoinedEventSchema>;

export const ActivityLeftEventSchema = z.object({
  activityId: z.string().uuid(),
  userId: z.string().uuid(),
  leftAt: z.string().datetime(),
});
export type ActivityLeftEvent = z.infer<typeof ActivityLeftEventSchema>;

export const ActivityFormedEventSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()),
  formedAt: z.string().datetime(),
});
export type ActivityFormedEvent = z.infer<typeof ActivityFormedEventSchema>;

export const ActivityCancelledEventSchema = z.object({
  activityId: z.string().uuid(),
  reason: z.enum(['BY_CREATOR', 'EXPIRED']),
  cancelledAt: z.string().datetime(),
});
export type ActivityCancelledEvent = z.infer<
  typeof ActivityCancelledEventSchema
>;

export const ActivityEndedEventSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()),
  completedAt: z.string().datetime(),
});
export type ActivityEndedEvent = z.infer<typeof ActivityEndedEventSchema>;

export const ActivityStatusChangedEventSchema = z.object({
  activityId: z.string().uuid(),
  fromStatus: ActivityStatusEnum,
  toStatus: ActivityStatusEnum,
  changedAt: z.string().datetime(),
});
export type ActivityStatusChangedEvent = z.infer<
  typeof ActivityStatusChangedEventSchema
>;

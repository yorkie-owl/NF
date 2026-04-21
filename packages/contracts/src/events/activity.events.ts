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

export const ActivityJoinedEventSchema = z.object({
  activityId: z.string().uuid(),
  userId: z.string().uuid(),
  joinedAt: z.string().datetime(),
});

export const ActivityLeftEventSchema = z.object({
  activityId: z.string().uuid(),
  userId: z.string().uuid(),
  leftAt: z.string().datetime(),
});

export const ActivityFormedEventSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()),
  formedAt: z.string().datetime(),
});

export const ActivityCancelledEventSchema = z.object({
  activityId: z.string().uuid(),
  reason: z.enum(['BY_CREATOR', 'EXPIRED']),
  cancelledAt: z.string().datetime(),
});

export const ActivityEndedEventSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()),
  completedAt: z.string().datetime(),
});

export const ActivityStatusChangedEventSchema = z.object({
  activityId: z.string().uuid(),
  fromStatus: ActivityStatusEnum,
  toStatus: ActivityStatusEnum,
  changedAt: z.string().datetime(),
});

export type ActivityCreatedEvent = z.infer<typeof ActivityCreatedEventSchema>;
export type ActivityJoinedEvent = z.infer<typeof ActivityJoinedEventSchema>;
export type ActivityLeftEvent = z.infer<typeof ActivityLeftEventSchema>;
export type ActivityFormedEvent = z.infer<typeof ActivityFormedEventSchema>;
export type ActivityCancelledEvent = z.infer<typeof ActivityCancelledEventSchema>;
export type ActivityEndedEvent = z.infer<typeof ActivityEndedEventSchema>;
export type ActivityStatusChangedEvent = z.infer<typeof ActivityStatusChangedEventSchema>;

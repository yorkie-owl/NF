import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from 'typeorm';
import {
  ACTIVITY_EVENTS,
  type ActivityCancelledEvent,
  type ActivityEndedEvent,
  type ActivityStatus,
  type ActivityStatusChangedEvent,
} from '@lin-shi/contracts';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityEventEntity } from '../activity-events/entities/activity-event.entity';
import { computeNextStatus, type TransitionEvent } from './transitions';

export interface TransitionSideEffects {
  from: ActivityStatus;
  to: ActivityStatus;
  changedAt: Date;
}

export interface TransitionInput {
  event: TransitionEvent;
  now: Date;
  actorId: string | null;
  participantCount: number;
  /** Optional pre-fetched row. If omitted, the service re-reads it. */
  activity?: ActivityEntity;
}

/**
 * Persist status changes using the pure `computeNextStatus` core. Side effects
 * are kept inside the provided EntityManager transaction so the call is atomic.
 *
 * Domain events are NOT emitted here -- the caller emits after its own tx
 * commits (see ActivitiesService.join / .leave / .cancel). The service DOES
 * append an `a_activity_events` audit row whenever the status changes.
 */
@Injectable()
export class ActivityStatusService {
  constructor(private readonly events: EventEmitter2) {}

  async transition(
    manager: EntityManager,
    activityId: string,
    input: TransitionInput,
  ): Promise<TransitionSideEffects | null> {
    const activities = manager.getRepository(ActivityEntity);
    const activity =
      input.activity ??
      (await activities.findOne({ where: { id: activityId } }));
    if (!activity) return null;

    const next = computeNextStatus(activity.status, input.event, {
      participantCount: input.participantCount,
      maxParticipants: activity.maxParticipants,
      startTime: activity.startTime,
      now: input.now,
    });
    if (next === null) return null;

    const from = activity.status;
    activity.status = next;
    if (next === 'CANCELLED') activity.cancelledAt = input.now;
    if (next === 'COMPLETED') activity.completedAt = input.now;
    await activities.save(activity);

    // Audit row.
    const eventsRepo = manager.getRepository(ActivityEventEntity);
    await eventsRepo.save(
      eventsRepo.create({
        activityId,
        type: 'STATUS_CHANGED',
        actorId: input.actorId,
        payload: { from, to: next },
      }),
    );

    return { from, to: next, changedAt: input.now };
  }

  /**
   * After-transaction emit helper. Converts a TransitionSideEffects into the
   * domain events other modules (E chat, F credit) subscribe to.
   */
  emitTransitionEvents(
    activityId: string,
    effects: TransitionSideEffects,
    extras: {
      participantIds: string[];
      cancelledBy: 'BY_CREATOR' | 'EXPIRED' | null;
    },
  ): void {
    const { from, to, changedAt } = effects;

    this.events.emit(ACTIVITY_EVENTS.STATUS_CHANGED, {
      activityId,
      fromStatus: from,
      toStatus: to,
      changedAt: changedAt.toISOString(),
    } satisfies ActivityStatusChangedEvent);

    if (to === 'CANCELLED' && extras.cancelledBy) {
      this.events.emit(ACTIVITY_EVENTS.CANCELLED, {
        activityId,
        reason: extras.cancelledBy,
        cancelledAt: changedAt.toISOString(),
      } satisfies ActivityCancelledEvent);
    }

    if (to === 'COMPLETED') {
      this.events.emit(ACTIVITY_EVENTS.ENDED, {
        activityId,
        participantIds: extras.participantIds,
        completedAt: changedAt.toISOString(),
      } satisfies ActivityEndedEvent);
    }
  }
}

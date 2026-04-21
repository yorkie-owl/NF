import type { ActivityStatus } from '@lin-shi/contracts';

/**
 * Events that can drive the activity state machine.
 * - JOIN / LEAVE: participant-count changes from the API
 * - CRON_TICK: time-based checks from ActivityStatusScheduler
 * - CANCEL_BY_CREATOR: explicit DELETE /activities/:id by the creator
 */
export type TransitionEvent =
  | 'JOIN'
  | 'LEAVE'
  | 'CRON_TICK'
  | 'CANCEL_BY_CREATOR';

export interface TransitionContext {
  /** Current participant count BEFORE the JOIN/LEAVE takes effect. */
  participantCount: number;
  maxParticipants: number;
  startTime: Date;
  now: Date;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const FOUR_HOURS_MS = 4 * ONE_HOUR_MS;

/**
 * Pure function: return the next ActivityStatus given the current status, an
 * event, and context. Returns null when no transition applies.
 *
 * The caller is responsible for persistence, event emission, and side effects.
 */
export function computeNextStatus(
  current: ActivityStatus,
  event: TransitionEvent,
  ctx: TransitionContext,
): ActivityStatus | null {
  // Creator cancellation from any non-terminal state.
  if (event === 'CANCEL_BY_CREATOR') {
    if (current === 'COMPLETED' || current === 'CANCELLED') return null;
    return 'CANCELLED';
  }

  if (current === 'WAITING_FOR_MEMBERS') {
    if (event === 'JOIN') {
      // participantCount is pre-insert; a JOIN raises it by 1.
      if (ctx.participantCount + 1 >= ctx.maxParticipants) return 'FORMED';
      return null;
    }
    if (event === 'CRON_TICK') {
      if (ctx.now > ctx.startTime) return 'CANCELLED';
      return null;
    }
  }

  if (current === 'FORMED') {
    if (event === 'LEAVE') {
      // Any drop below the filled threshold falls back to waiting.
      return 'WAITING_FOR_MEMBERS';
    }
    if (event === 'CRON_TICK') {
      const startingSoonAt = new Date(ctx.startTime.getTime() - ONE_HOUR_MS);
      if (ctx.now >= startingSoonAt) return 'STARTING_SOON';
      return null;
    }
  }

  if (current === 'STARTING_SOON') {
    if (event === 'CRON_TICK' && ctx.now >= ctx.startTime) {
      return 'IN_PROGRESS';
    }
    // LEAVE from STARTING_SOON is allowed functionally but not a state change.
    return null;
  }

  if (current === 'IN_PROGRESS') {
    if (event === 'CRON_TICK') {
      const endAt = new Date(ctx.startTime.getTime() + FOUR_HOURS_MS);
      if (ctx.now >= endAt) return 'COMPLETED';
      return null;
    }
  }

  return null;
}

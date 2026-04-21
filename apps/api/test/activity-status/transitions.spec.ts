import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  computeNextStatus,
  type TransitionContext,
} from '../../src/activity-status/transitions';

const START = new Date('2026-05-01T18:00:00Z');

function ctx(overrides: Partial<TransitionContext> = {}): TransitionContext {
  return {
    participantCount: 1,
    maxParticipants: 4,
    startTime: START,
    now: new Date('2026-04-30T10:00:00Z'),
    ...overrides,
  };
}

describe('computeNextStatus', () => {
  it('WAITING + JOIN not full -> stays (null)', () => {
    assert.equal(
      computeNextStatus('WAITING_FOR_MEMBERS', 'JOIN', ctx({ participantCount: 1, maxParticipants: 4 })),
      null,
    );
  });

  it('WAITING + JOIN fills up -> FORMED', () => {
    assert.equal(
      computeNextStatus('WAITING_FOR_MEMBERS', 'JOIN', ctx({ participantCount: 3, maxParticipants: 4 })),
      'FORMED',
    );
  });

  it('WAITING + CRON_TICK past startTime -> CANCELLED (expired)', () => {
    assert.equal(
      computeNextStatus('WAITING_FOR_MEMBERS', 'CRON_TICK', ctx({ now: new Date('2026-05-01T18:01:00Z') })),
      'CANCELLED',
    );
  });

  it('WAITING + CRON_TICK before startTime -> no change', () => {
    assert.equal(
      computeNextStatus('WAITING_FOR_MEMBERS', 'CRON_TICK', ctx({ now: new Date('2026-05-01T17:00:00Z') })),
      null,
    );
  });

  it('FORMED + LEAVE -> WAITING_FOR_MEMBERS', () => {
    assert.equal(
      computeNextStatus('FORMED', 'LEAVE', ctx({ participantCount: 4, maxParticipants: 4 })),
      'WAITING_FOR_MEMBERS',
    );
  });

  it('FORMED + CRON_TICK within 1h window -> STARTING_SOON', () => {
    assert.equal(
      computeNextStatus('FORMED', 'CRON_TICK', ctx({ now: new Date('2026-05-01T17:30:00Z') })),
      'STARTING_SOON',
    );
  });

  it('FORMED + CRON_TICK outside 1h window -> no change', () => {
    assert.equal(
      computeNextStatus('FORMED', 'CRON_TICK', ctx({ now: new Date('2026-05-01T16:00:00Z') })),
      null,
    );
  });

  it('STARTING_SOON + CRON_TICK at startTime -> IN_PROGRESS', () => {
    assert.equal(
      computeNextStatus('STARTING_SOON', 'CRON_TICK', ctx({ now: new Date('2026-05-01T18:00:00Z') })),
      'IN_PROGRESS',
    );
  });

  it('IN_PROGRESS + CRON_TICK past 4h -> COMPLETED', () => {
    assert.equal(
      computeNextStatus('IN_PROGRESS', 'CRON_TICK', ctx({ now: new Date('2026-05-01T22:00:01Z') })),
      'COMPLETED',
    );
  });

  it('IN_PROGRESS + CRON_TICK before 4h -> no change', () => {
    assert.equal(
      computeNextStatus('IN_PROGRESS', 'CRON_TICK', ctx({ now: new Date('2026-05-01T21:00:00Z') })),
      null,
    );
  });

  it('CANCEL_BY_CREATOR from WAITING -> CANCELLED', () => {
    assert.equal(
      computeNextStatus('WAITING_FOR_MEMBERS', 'CANCEL_BY_CREATOR', ctx()),
      'CANCELLED',
    );
  });

  it('CANCEL_BY_CREATOR from FORMED -> CANCELLED', () => {
    assert.equal(computeNextStatus('FORMED', 'CANCEL_BY_CREATOR', ctx()), 'CANCELLED');
  });

  it('CANCEL_BY_CREATOR from COMPLETED -> no change (null)', () => {
    assert.equal(computeNextStatus('COMPLETED', 'CANCEL_BY_CREATOR', ctx()), null);
  });

  it('CANCEL_BY_CREATOR from CANCELLED -> no change (null)', () => {
    assert.equal(computeNextStatus('CANCELLED', 'CANCEL_BY_CREATOR', ctx()), null);
  });
});

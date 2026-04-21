import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, IsNull, LessThan, LessThanOrEqual } from 'typeorm';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityParticipantEntity } from '../activities/entities/activity-participant.entity';
import { ActivityStatusService } from './activity-status.service';

/**
 * Drive the time-based transitions (WAITING → CANCELLED on expiry,
 * FORMED → STARTING_SOON, STARTING_SOON → IN_PROGRESS, IN_PROGRESS → COMPLETED)
 * by calling `ActivityStatusService.transition` with event='CRON_TICK' for
 * every candidate row.
 *
 * Each candidate is processed in its own tx so a single failure does not block
 * the rest of the batch.
 */
@Injectable()
export class ActivityStatusScheduler {
  private readonly logger = new Logger(ActivityStatusScheduler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly status: ActivityStatusService,
  ) {}

  /** FORMED → STARTING_SOON (startTime within 1h). */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async promoteToStartingSoon(): Promise<void> {
    const now = new Date();
    const threshold = new Date(now.getTime() + 60 * 60 * 1000);
    const repo = this.dataSource.getRepository(ActivityEntity);
    const rows = await repo.find({
      where: { status: 'FORMED', startTime: LessThanOrEqual(threshold) },
    });
    for (const row of rows) await this.tick(row.id, now);
  }

  /** STARTING_SOON → IN_PROGRESS (startTime reached). */
  @Cron(CronExpression.EVERY_MINUTE)
  async startInProgress(): Promise<void> {
    const now = new Date();
    const repo = this.dataSource.getRepository(ActivityEntity);
    const rows = await repo.find({
      where: { status: 'STARTING_SOON', startTime: LessThanOrEqual(now) },
    });
    for (const row of rows) await this.tick(row.id, now);
  }

  /** IN_PROGRESS → COMPLETED (startTime + 4h reached). */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async completeActivities(): Promise<void> {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const repo = this.dataSource.getRepository(ActivityEntity);
    const rows = await repo.find({
      where: { status: 'IN_PROGRESS', startTime: LessThanOrEqual(fourHoursAgo) },
    });
    for (const row of rows) await this.tick(row.id, now);
  }

  /** WAITING_FOR_MEMBERS past startTime → CANCELLED. */
  @Cron(CronExpression.EVERY_HOUR)
  async expireWaitingActivities(): Promise<void> {
    const now = new Date();
    const repo = this.dataSource.getRepository(ActivityEntity);
    const rows = await repo.find({
      where: { status: 'WAITING_FOR_MEMBERS', startTime: LessThan(now) },
    });
    for (const row of rows) await this.tick(row.id, now);
  }

  private async tick(activityId: string, now: Date): Promise<void> {
    try {
      const result = await this.dataSource.transaction(async (manager) => {
        const activity = await manager
          .getRepository(ActivityEntity)
          .findOne({ where: { id: activityId } });
        if (!activity) return null;

        const participantCount = await manager
          .getRepository(ActivityParticipantEntity)
          .count({ where: { activityId, leftAt: IsNull() } });

        const effects = await this.status.transition(manager, activityId, {
          event: 'CRON_TICK',
          now,
          actorId: null,
          participantCount,
          activity,
        });

        if (!effects) return null;

        const participantRows = await manager
          .getRepository(ActivityParticipantEntity)
          .find({ where: { activityId, leftAt: IsNull() } });
        const participantIds = participantRows.map((p) => p.userId);

        return { effects, participantIds };
      });

      if (!result) return;

      const cancelledBy =
        result.effects.to === 'CANCELLED' ? 'EXPIRED' : null;
      this.status.emitTransitionEvents(activityId, result.effects, {
        participantIds: result.participantIds,
        cancelledBy,
      });
    } catch (err: unknown) {
      this.logger.error(
        `CRON_TICK failed for activity ${activityId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

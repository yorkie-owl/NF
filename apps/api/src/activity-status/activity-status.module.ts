import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityParticipantEntity } from '../activities/entities/activity-participant.entity';
import { ActivityEventEntity } from '../activity-events/entities/activity-event.entity';
import { ActivityStatusService } from './activity-status.service';
import { ActivityStatusScheduler } from './activity-status.scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityEntity,
      ActivityParticipantEntity,
      ActivityEventEntity,
    ]),
  ],
  providers: [ActivityStatusService, ActivityStatusScheduler],
  exports: [ActivityStatusService],
})
export class ActivityStatusModule {}

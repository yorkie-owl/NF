import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityEventEntity } from '../activity-events/entities/activity-event.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ActivityFeedReadEntity } from './entities/activity-feed-read.entity';
import { ActivityFeedsService } from './activity-feeds.service';
import { ActivityFeedsController } from './activity-feeds.controller';
import { ExternalModule } from '../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityEntity,
      ActivityEventEntity,
      UserEntity,
      ActivityFeedReadEntity,
    ]),
    ExternalModule,
  ],
  controllers: [ActivityFeedsController],
  providers: [ActivityFeedsService],
  exports: [ActivityFeedsService],
})
export class ActivityFeedsModule {}

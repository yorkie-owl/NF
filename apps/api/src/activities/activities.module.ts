import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityParticipantEntity } from './entities/activity-participant.entity';
import { ActivityIngredientEntity } from './entities/activity-ingredient.entity';
import { ActivityManualIngredientEntity } from './entities/activity-manual-ingredient.entity';
import { ActivityEventEntity } from '../activity-events/entities/activity-event.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { ActivityStatusModule } from '../activity-status/activity-status.module';
import { ExternalModule } from '../external/external.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityEntity,
      ActivityParticipantEntity,
      ActivityIngredientEntity,
      ActivityManualIngredientEntity,
      ActivityEventEntity,
      UserEntity,
    ]),
    ActivityStatusModule,
    ExternalModule,
  ],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}

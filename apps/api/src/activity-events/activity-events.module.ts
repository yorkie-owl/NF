import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEventEntity } from './entities/activity-event.entity';
import { ActivityEventsService } from './activity-events.service';
import { ActivityEventsController } from './activity-events.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEventEntity])],
  controllers: [ActivityEventsController],
  providers: [ActivityEventsService],
  exports: [ActivityEventsService],
})
export class ActivityEventsModule {}

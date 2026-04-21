import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  ActivityEvent,
  PaginatedResponse,
  PaginationQuery,
} from '@lin-shi/contracts';
import { ActivityEventEntity } from './entities/activity-event.entity';

@Injectable()
export class ActivityEventsService {
  constructor(
    @InjectRepository(ActivityEventEntity)
    private readonly repo: Repository<ActivityEventEntity>,
  ) {}

  async list(
    activityId: string,
    query: PaginationQuery,
  ): Promise<PaginatedResponse<ActivityEvent>> {
    const [rows, total] = await this.repo.findAndCount({
      where: { activityId },
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    });
    return {
      items: rows.map((r) => ({
        id: r.id,
        activityId: r.activityId,
        type: r.type,
        actorId: r.actorId,
        payload: r.payload,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, IsNull, Repository } from 'typeorm';
import {
  ACTIVITY_EVENTS,
  type Activity,
  type ActivityCancelledEvent,
  type ActivityCreatedEvent,
  type ActivityDetail,
  type ActivityFormedEvent,
  type ActivityJoinedEvent,
  type ActivityLeftEvent,
  type ActivityParticipant,
  type ActivityStatus,
  type CreateActivityRequest,
  type ListActivitiesQuery,
  type PaginatedResponse,
} from '@lin-shi/contracts';
import { ActivityEntity } from './entities/activity.entity';
import { ActivityParticipantEntity } from './entities/activity-participant.entity';
import { ActivityIngredientEntity } from './entities/activity-ingredient.entity';
import { ActivityManualIngredientEntity } from './entities/activity-manual-ingredient.entity';
import { ActivityEventEntity } from '../activity-events/entities/activity-event.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ActivityStatusService } from '../activity-status/activity-status.service';
import {
  CHAT_CLIENT,
  type ChatClient,
} from '../external/chat.client';
import {
  CREDIT_CLIENT,
  type CreditClient,
} from '../external/credit.client';
import {
  INGREDIENTS_CLIENT,
  type IngredientsClient,
} from '../external/ingredients.client';

const HIGH_TRUST_THRESHOLD = 70;

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activities: Repository<ActivityEntity>,
    @InjectRepository(ActivityParticipantEntity)
    private readonly participants: Repository<ActivityParticipantEntity>,
    private readonly dataSource: DataSource,
    private readonly statusService: ActivityStatusService,
    private readonly events: EventEmitter2,
    @Inject(CHAT_CLIENT) private readonly chat: ChatClient,
    @Inject(CREDIT_CLIENT) private readonly credit: CreditClient,
    @Inject(INGREDIENTS_CLIENT) private readonly ingredients: IngredientsClient,
  ) {}

  async create(
    userId: string,
    req: CreateActivityRequest,
  ): Promise<ActivityDetail> {
    const startTime = new Date(req.startTime);
    if (startTime.getTime() <= Date.now()) {
      throw new BadRequestException({
        code: 'ACTIVITY_START_IN_PAST',
        message: '开始时间必须在未来',
      });
    }

    if (req.ingredientIds.length > 0) {
      const known = await this.ingredients.getByIds(req.ingredientIds);
      if (known.length !== req.ingredientIds.length) {
        throw new BadRequestException({
          code: 'ACTIVITY_INGREDIENT_NOT_FOUND',
          message: '部分食材不存在',
        });
      }
    }

    const activity = await this.dataSource.transaction(async (manager) => {
      const activitiesRepo = manager.getRepository(ActivityEntity);
      const created = await activitiesRepo.save(
        activitiesRepo.create({
          title: req.title,
          description: req.description ?? null,
          startTime,
          location: req.location,
          maxParticipants: req.maxParticipants,
          joinScope: req.joinScope,
          status: 'WAITING_FOR_MEMBERS',
          createdBy: userId,
        }),
      );

      // Creator auto-joins.
      await manager.getRepository(ActivityParticipantEntity).save(
        manager.getRepository(ActivityParticipantEntity).create({
          activityId: created.id,
          userId,
        }),
      );

      if (req.ingredientIds.length > 0) {
        const ingRepo = manager.getRepository(ActivityIngredientEntity);
        await ingRepo.save(
          req.ingredientIds.map((id) =>
            ingRepo.create({
              activityId: created.id,
              ingredientId: id,
              addedBy: userId,
            }),
          ),
        );
      }

      if (req.manualIngredients.length > 0) {
        const manRepo = manager.getRepository(ActivityManualIngredientEntity);
        const seen = new Set<string>();
        const rows = req.manualIngredients
          .filter((n) => {
            const t = n.trim();
            if (t === '' || seen.has(t)) return false;
            seen.add(t);
            return true;
          })
          .map((name) =>
            manRepo.create({
              activityId: created.id,
              name,
              addedBy: userId,
            }),
          );
        if (rows.length > 0) await manRepo.save(rows);
      }

      await manager.getRepository(ActivityEventEntity).save(
        manager.getRepository(ActivityEventEntity).create({
          activityId: created.id,
          type: 'CREATED',
          actorId: userId,
          payload: { title: req.title },
        }),
      );

      return created;
    });

    this.events.emit(ACTIVITY_EVENTS.CREATED, {
      activityId: activity.id,
      createdBy: userId,
      createdAt: activity.createdAt.toISOString(),
    } satisfies ActivityCreatedEvent);

    return this.loadDetail(activity.id);
  }

  async list(
    viewerId: string,
    query: ListActivitiesQuery,
  ): Promise<PaginatedResponse<Activity>> {
    const qb = this.activities
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC');

    if (query.status !== undefined) {
      const statuses = Array.isArray(query.status)
        ? query.status
        : [query.status];
      qb.andWhere('a.status IN (:...statuses)', { statuses });
    }
    if (query.joinScope !== undefined) {
      qb.andWhere('a.join_scope = :joinScope', { joinScope: query.joinScope });
    }
    if (query.createdBy !== undefined) {
      qb.andWhere('a.created_by = :createdBy', { createdBy: query.createdBy });
    }
    if (query.joinedBy !== undefined) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM a_activity_participants p WHERE p.activity_id = a.id AND p.user_id = :joinedBy AND p.left_at IS NULL)`,
        { joinedBy: query.joinedBy },
      );
    }
    if (query.minParticipants !== undefined) {
      qb.andWhere('a.max_participants >= :minP', {
        minP: query.minParticipants,
      });
    }
    if (query.maxParticipants !== undefined) {
      qb.andWhere('a.max_participants <= :maxP', {
        maxP: query.maxParticipants,
      });
    }
    if (query.from !== undefined) {
      qb.andWhere('a.start_time >= :from', { from: query.from });
    }
    if (query.to !== undefined) {
      qb.andWhere('a.start_time <= :to', { to: query.to });
    }
    if (query.scope === 'mine') {
      qb.andWhere(
        new Brackets((b) => {
          b.where('a.created_by = :viewerId', { viewerId }).orWhere(
            `EXISTS (SELECT 1 FROM a_activity_participants p WHERE p.activity_id = a.id AND p.user_id = :viewerId AND p.left_at IS NULL)`,
            { viewerId },
          );
        }),
      );
    }

    qb.skip((query.page - 1) * query.pageSize).take(query.pageSize);

    const [rows, total] = await qb.getManyAndCount();
    if (rows.length === 0) {
      return { items: [], total, page: query.page, pageSize: query.pageSize };
    }

    const counts = await this.participantCounts(rows.map((r) => r.id));
    return {
      items: rows.map((r) => toActivity(r, counts.get(r.id) ?? 0)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async getDetail(activityId: string): Promise<ActivityDetail> {
    return this.loadDetail(activityId);
  }

  async join(userId: string, activityId: string): Promise<ActivityDetail> {
    const result = await this.dataSource.transaction(async (manager) => {
      const activitiesRepo = manager.getRepository(ActivityEntity);
      const activity = await activitiesRepo.findOne({
        where: { id: activityId },
      });
      if (!activity) throw notFound();

      if (activity.status !== 'WAITING_FOR_MEMBERS') {
        throw new ConflictException({
          code: 'ACTIVITY_NOT_JOINABLE',
          message: '当前状态不可加入',
        });
      }

      const partRepo = manager.getRepository(ActivityParticipantEntity);
      const activeParticipants = await partRepo.find({
        where: { activityId, leftAt: IsNull() },
      });
      if (activeParticipants.length >= activity.maxParticipants) {
        throw new ConflictException({
          code: 'ACTIVITY_FULL',
          message: '锅已满员',
        });
      }
      if (activeParticipants.some((p) => p.userId === userId)) {
        throw new ConflictException({
          code: 'ACTIVITY_ALREADY_JOINED',
          message: '你已加入此锅',
        });
      }

      if (activity.joinScope === 'HIGH_TRUST_ONLY') {
        const score = await this.credit
          .getUserCredit(userId)
          .then((s) => s.score)
          .catch((): number => 0);
        if (score < HIGH_TRUST_THRESHOLD) {
          throw new ForbiddenException({
            code: 'ACTIVITY_SCOPE_FORBIDS',
            message: '信用分不足，无法加入高信任锅',
          });
        }
      }

      // Reinstate a previously-left participant rather than duplicating rows.
      const existing = await partRepo.findOne({
        where: { activityId, userId },
      });
      if (existing) {
        existing.leftAt = null;
        existing.joinedAt = new Date();
        await partRepo.save(existing);
      } else {
        await partRepo.save(partRepo.create({ activityId, userId }));
      }

      const participantCount = activeParticipants.length; // pre-join count

      const effects = await this.statusService.transition(
        manager,
        activityId,
        {
          event: 'JOIN',
          now: new Date(),
          actorId: userId,
          participantCount,
          activity,
        },
      );

      await manager.getRepository(ActivityEventEntity).save(
        manager.getRepository(ActivityEventEntity).create({
          activityId,
          type: 'JOINED',
          actorId: userId,
          payload: {},
        }),
      );

      let chatRoomId: string | null = activity.chatRoomId;
      let participantIds: string[] = [
        ...activeParticipants.map((p) => p.userId),
        userId,
      ];

      if (effects?.to === 'FORMED' && !chatRoomId) {
        const room = await this.chat.createRoom({
          activityId,
          participantIds,
        });
        chatRoomId = room.roomId;
        activity.chatRoomId = chatRoomId;
        await activitiesRepo.save(activity);

        await manager.getRepository(ActivityEventEntity).save(
          manager.getRepository(ActivityEventEntity).create({
            activityId,
            type: 'FORMED',
            actorId: null,
            payload: { chatRoomId },
          }),
        );
      }

      return { effects, participantIds, chatRoomId };
    });

    const joinedAtIso = new Date().toISOString();
    this.events.emit(ACTIVITY_EVENTS.JOINED, {
      activityId,
      userId,
      joinedAt: joinedAtIso,
    } satisfies ActivityJoinedEvent);

    if (result.effects?.to === 'FORMED') {
      this.events.emit(ACTIVITY_EVENTS.FORMED, {
        activityId,
        participantIds: result.participantIds,
        formedAt: joinedAtIso,
      } satisfies ActivityFormedEvent);
      // STATUS_CHANGED audit row already written by statusService; emit domain event too.
      this.statusService.emitTransitionEvents(activityId, result.effects, {
        participantIds: result.participantIds,
        cancelledBy: null,
      });
    }

    return this.loadDetail(activityId);
  }

  async leave(userId: string, activityId: string): Promise<ActivityDetail> {
    const result = await this.dataSource.transaction(async (manager) => {
      const activitiesRepo = manager.getRepository(ActivityEntity);
      const activity = await activitiesRepo.findOne({
        where: { id: activityId },
      });
      if (!activity) throw notFound();

      if (
        activity.status === 'COMPLETED' ||
        activity.status === 'CANCELLED' ||
        activity.status === 'IN_PROGRESS'
      ) {
        throw new ConflictException({
          code: 'ACTIVITY_NOT_LEAVABLE',
          message: '当前状态不可退出',
        });
      }

      const partRepo = manager.getRepository(ActivityParticipantEntity);
      const existing = await partRepo.findOne({
        where: { activityId, userId, leftAt: IsNull() },
      });
      if (!existing) {
        throw new ConflictException({
          code: 'ACTIVITY_NOT_JOINED',
          message: '你未加入此锅',
        });
      }

      // Creator cannot leave; they cancel instead.
      if (activity.createdBy === userId) {
        throw new ForbiddenException({
          code: 'ACTIVITY_NOT_LEAVABLE',
          message: '创建者不能退出锅，只能取消活动',
        });
      }

      existing.leftAt = new Date();
      await partRepo.save(existing);

      const remaining = await partRepo.count({
        where: { activityId, leftAt: IsNull() },
      });

      const effects = await this.statusService.transition(
        manager,
        activityId,
        {
          event: 'LEAVE',
          now: new Date(),
          actorId: userId,
          participantCount: remaining,
          activity,
        },
      );

      await manager.getRepository(ActivityEventEntity).save(
        manager.getRepository(ActivityEventEntity).create({
          activityId,
          type: 'LEFT',
          actorId: userId,
          payload: {},
        }),
      );

      const participantRows = await partRepo.find({
        where: { activityId, leftAt: IsNull() },
      });
      return {
        effects,
        participantIds: participantRows.map((p) => p.userId),
        chatRoomId: activity.chatRoomId,
      };
    });

    const leftAtIso = new Date().toISOString();
    this.events.emit(ACTIVITY_EVENTS.LEFT, {
      activityId,
      userId,
      leftAt: leftAtIso,
    } satisfies ActivityLeftEvent);

    if (result.effects) {
      this.statusService.emitTransitionEvents(activityId, result.effects, {
        participantIds: result.participantIds,
        cancelledBy: null,
      });
    }

    if (result.chatRoomId) {
      await this.chat
        .removeParticipant(result.chatRoomId, userId)
        .catch(() => undefined);
    }

    return this.loadDetail(activityId);
  }

  async cancel(userId: string, activityId: string): Promise<void> {
    const result = await this.dataSource.transaction(async (manager) => {
      const activitiesRepo = manager.getRepository(ActivityEntity);
      const activity = await activitiesRepo.findOne({
        where: { id: activityId },
      });
      if (!activity) throw notFound();

      if (activity.createdBy !== userId) {
        throw new ForbiddenException({
          code: 'ACTIVITY_NOT_CREATOR',
          message: '只有创建者能取消活动',
        });
      }
      if (
        activity.status === 'COMPLETED' ||
        activity.status === 'CANCELLED'
      ) {
        throw new ConflictException({
          code: 'ACTIVITY_NOT_CANCELLABLE',
          message: '活动已终结，不能取消',
        });
      }

      const partRepo = manager.getRepository(ActivityParticipantEntity);
      const activeCount = await partRepo.count({
        where: { activityId, leftAt: IsNull() },
      });

      const effects = await this.statusService.transition(
        manager,
        activityId,
        {
          event: 'CANCEL_BY_CREATOR',
          now: new Date(),
          actorId: userId,
          participantCount: activeCount,
          activity,
        },
      );

      await manager.getRepository(ActivityEventEntity).save(
        manager.getRepository(ActivityEventEntity).create({
          activityId,
          type: 'CANCELLED',
          actorId: userId,
          payload: { reason: 'BY_CREATOR' },
        }),
      );

      const participantRows = await partRepo.find({
        where: { activityId, leftAt: IsNull() },
      });
      return { effects, participantIds: participantRows.map((p) => p.userId) };
    });

    if (result.effects) {
      this.statusService.emitTransitionEvents(activityId, result.effects, {
        participantIds: result.participantIds,
        cancelledBy: 'BY_CREATOR',
      });
    } else {
      // Defensive: emit cancelled anyway if transition fired null (shouldn't).
      this.events.emit(ACTIVITY_EVENTS.CANCELLED, {
        activityId,
        reason: 'BY_CREATOR',
        cancelledAt: new Date().toISOString(),
      } satisfies ActivityCancelledEvent);
    }
  }

  async loadDetail(activityId: string): Promise<ActivityDetail> {
    const activity = await this.activities.findOne({
      where: { id: activityId },
    });
    if (!activity) throw notFound();

    const [participants, ingredients, manualIngredients] = await Promise.all([
      this.loadParticipants(activityId),
      this.loadIngredients(activityId),
      this.loadManualIngredients(activityId),
    ]);

    const activeCount = participants.filter((p) => p.leftAt === null).length;
    return {
      ...toActivity(activity, activeCount),
      participants,
      ingredients,
      manualIngredients,
    };
  }

  private async loadParticipants(
    activityId: string,
  ): Promise<ActivityParticipant[]> {
    const rows = await this.participants.find({
      where: { activityId },
      order: { joinedAt: 'ASC' },
    });
    if (rows.length === 0) return [];
    const users = await this.dataSource
      .getRepository(UserEntity)
      .find({ where: { id: In(rows.map((r) => r.userId)) } });
    const userById = new Map(users.map((u) => [u.id, u]));
    return rows.map((r) => {
      const user = userById.get(r.userId);
      return {
        userId: r.userId,
        nickname: user?.nickname ?? '',
        avatarUrl: user?.avatarUrl ?? null,
        joinedAt: r.joinedAt.toISOString(),
        leftAt: r.leftAt ? r.leftAt.toISOString() : null,
      };
    });
  }

  private async loadIngredients(activityId: string): Promise<
    ActivityDetail['ingredients']
  > {
    const rows = await this.dataSource
      .getRepository(ActivityIngredientEntity)
      .find({ where: { activityId } });
    return rows.map((r) => ({
      ingredientId: r.ingredientId,
      addedBy: r.addedBy,
      addedAt: r.addedAt.toISOString(),
    }));
  }

  private async loadManualIngredients(
    activityId: string,
  ): Promise<ActivityDetail['manualIngredients']> {
    const rows = await this.dataSource
      .getRepository(ActivityManualIngredientEntity)
      .find({ where: { activityId } });
    return rows.map((r) => ({
      name: r.name,
      addedBy: r.addedBy,
      addedAt: r.addedAt.toISOString(),
    }));
  }

  private async participantCounts(
    activityIds: string[],
  ): Promise<Map<string, number>> {
    if (activityIds.length === 0) return new Map();
    const rows = (await this.participants
      .createQueryBuilder('p')
      .select('p.activity_id', 'activityId')
      .addSelect('COUNT(*)::int', 'count')
      .where('p.activity_id IN (:...ids)', { ids: activityIds })
      .andWhere('p.left_at IS NULL')
      .groupBy('p.activity_id')
      .getRawMany()) as Array<{ activityId: string; count: number }>;
    return new Map(rows.map((r) => [r.activityId, r.count]));
  }
}

function toActivity(row: ActivityEntity, participantCount: number): Activity {
  const status: ActivityStatus = row.status;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startTime: row.startTime.toISOString(),
    location: row.location,
    maxParticipants: row.maxParticipants,
    joinScope: row.joinScope,
    status,
    createdBy: row.createdBy,
    chatRoomId: row.chatRoomId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    participantCount,
  };
}

function notFound(): NotFoundException {
  return new NotFoundException({
    code: 'ACTIVITY_NOT_FOUND',
    message: '活动不存在',
  });
}

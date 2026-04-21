import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import type {
  ActivityEventType,
  ActivityFeedItem,
  ActivityFeedLastMessage,
  ListActivityFeedsQuery,
  PaginatedResponse,
} from '@lin-shi/contracts';
import { ActivityEntity } from '../activities/entities/activity.entity';
import { ActivityEventEntity } from '../activity-events/entities/activity-event.entity';
import { ActivityFeedReadEntity } from './entities/activity-feed-read.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CHAT_CLIENT, type ChatClient } from '../external/chat.client';

const COMPLETED_RETENTION_DAYS = 7;
const STARTING_SOON_WINDOW_HOURS = 2;
const PREVIEW_MAX_CHARS = 30;

@Injectable()
export class ActivityFeedsService {
  constructor(
    @InjectRepository(ActivityEntity)
    private readonly activities: Repository<ActivityEntity>,
    @InjectRepository(ActivityFeedReadEntity)
    private readonly reads: Repository<ActivityFeedReadEntity>,
    private readonly dataSource: DataSource,
    @Inject(CHAT_CLIENT) private readonly chat: ChatClient,
  ) {}

  async list(
    userId: string,
    query: ListActivityFeedsQuery,
  ): Promise<PaginatedResponse<ActivityFeedItem>> {
    const cutoff = new Date(
      Date.now() - COMPLETED_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    );

    const rows = await this.activities
      .createQueryBuilder('a')
      .where(
        new Brackets((b) => {
          b.where('a.created_by = :uid', { uid: userId }).orWhere(
            `EXISTS (SELECT 1 FROM a_activity_participants p WHERE p.activity_id = a.id AND p.user_id = :uid AND p.left_at IS NULL)`,
            { uid: userId },
          );
        }),
      )
      .andWhere(
        new Brackets((b) => {
          b.where('a.status != :c', { c: 'COMPLETED' }).orWhere(
            'a.completed_at >= :cutoff',
            { cutoff },
          );
        }),
      )
      .orderBy('a.updated_at', 'DESC')
      .getMany();

    if (rows.length === 0) {
      return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
    }

    const latest = await this.loadLatestEvents(rows.map((r) => r.id));
    const reads = await this.reads.find({
      where: { userId, activityId: In(rows.map((r) => r.id)) },
    });
    const readByActivity = new Map(
      reads.map((r) => [r.activityId, r.lastReadAt]),
    );

    const items = await Promise.all(
      rows.map(async (a): Promise<ActivityFeedItem> => {
        const lastRead = readByActivity.get(a.id) ?? null;
        const lastMessage = await this.buildLastMessage(
          a.chatRoomId,
          latest.get(a.id) ?? null,
          lastRead,
        );
        return {
          activityId: a.id,
          activityTitle: a.title,
          activityEmoji: deriveEmoji(a.title),
          activityStatus: a.status,
          lastMessage,
          updatedAt: a.updatedAt.toISOString(),
        };
      }),
    );

    const now = Date.now();
    const startTimeById = new Map(rows.map((r) => [r.id, r.startTime]));
    const filtered = items.filter((it) =>
      matchesFilter(it, query.status, startTimeById.get(it.activityId), now),
    );

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    return {
      items: filtered.slice(start, start + query.pageSize),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async markRead(userId: string, activityId: string): Promise<void> {
    const existing = await this.reads.findOne({
      where: { userId, activityId },
    });
    const now = new Date();
    if (existing) {
      existing.lastReadAt = now;
      await this.reads.save(existing);
      return;
    }
    await this.reads.save(
      this.reads.create({ userId, activityId, lastReadAt: now }),
    );
  }

  private async loadLatestEvents(
    activityIds: string[],
  ): Promise<
    Map<string, { event: ActivityEventEntity; actor: UserEntity | null }>
  > {
    if (activityIds.length === 0) return new Map();
    const rows = await this.dataSource
      .getRepository(ActivityEventEntity)
      .createQueryBuilder('e')
      .distinctOn(['e.activity_id'])
      .where('e.activity_id IN (:...ids)', { ids: activityIds })
      .orderBy('e.activity_id')
      .addOrderBy('e.created_at', 'DESC')
      .getMany();

    const actorIds = rows
      .map((r) => r.actorId)
      .filter((v): v is string => v !== null);
    const actors =
      actorIds.length > 0
        ? await this.dataSource
            .getRepository(UserEntity)
            .find({ where: { id: In(actorIds) } })
        : [];
    const actorById = new Map(actors.map((u) => [u.id, u]));

    const result = new Map<
      string,
      { event: ActivityEventEntity; actor: UserEntity | null }
    >();
    for (const e of rows) {
      result.set(e.activityId, {
        event: e,
        actor: e.actorId ? actorById.get(e.actorId) ?? null : null,
      });
    }
    return result;
  }

  private async buildLastMessage(
    chatRoomId: string | null,
    latest:
      | { event: ActivityEventEntity; actor: UserEntity | null }
      | null,
    lastRead: Date | null,
  ): Promise<ActivityFeedLastMessage | null> {
    if (chatRoomId) {
      const chatLast = await this.chat
        .getLastMessage(chatRoomId)
        .catch((): null => null);
      if (chatLast) {
        const unread = await this.chat
          .countUnread(chatRoomId, lastRead ? lastRead.toISOString() : null)
          .catch((): number => 0);
        return {
          type: 'CHAT',
          preview: truncate(chatLast.preview, PREVIEW_MAX_CHARS),
          senderNickname: chatLast.senderNickname,
          unreadCount: unread,
          at: chatLast.at,
        };
      }
    }

    if (!latest) return null;
    const preview = renderSystemPreview(
      latest.event.type,
      latest.actor?.nickname ?? null,
    );
    const unreadCount =
      lastRead && latest.event.createdAt <= lastRead ? 0 : 1;
    return {
      type: 'SYSTEM',
      preview: truncate(preview, PREVIEW_MAX_CHARS),
      senderNickname: null,
      unreadCount,
      at: latest.event.createdAt.toISOString(),
    };
  }
}

function matchesFilter(
  item: ActivityFeedItem,
  filter: ListActivityFeedsQuery['status'],
  startTime: Date | undefined,
  nowMs: number,
): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'UNREAD') return (item.lastMessage?.unreadCount ?? 0) > 0;
  if (filter === 'IN_PROGRESS') {
    return (
      item.activityStatus === 'FORMED' ||
      item.activityStatus === 'IN_PROGRESS'
    );
  }
  if (filter === 'STARTING_SOON') {
    if (item.activityStatus === 'STARTING_SOON') return true;
    if (item.activityStatus === 'FORMED' && startTime) {
      const delta = startTime.getTime() - nowMs;
      return delta >= 0 && delta < STARTING_SOON_WINDOW_HOURS * 60 * 60 * 1000;
    }
    return false;
  }
  return true;
}

function deriveEmoji(title: string): string {
  const match = title.match(
    /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{27BF}]/u,
  );
  return match?.[0] ?? '🍲';
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

function renderSystemPreview(
  type: ActivityEventType,
  actor: string | null,
): string {
  const who = actor ?? '有人';
  switch (type) {
    case 'CREATED':
      return `${who} 发起了新锅`;
    case 'JOINED':
      return `${who} 加入了锅`;
    case 'LEFT':
      return `${who} 退出了锅`;
    case 'FORMED':
      return '锅已满员，聊天室已开启';
    case 'STATUS_CHANGED':
      return '活动状态已更新';
    case 'INGREDIENT_ADDED':
      return `${who} 添加了食材`;
    case 'INGREDIENT_REMOVED':
      return `${who} 移除了食材`;
    case 'CANCELLED':
      return '活动已取消';
    case 'COMPLETED':
      return '活动已结束';
    default:
      return '活动有新动态';
  }
}

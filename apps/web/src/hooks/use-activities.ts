'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ActivitySchema,
  paginatedResponseSchema,
  type Activity,
  type ActivityJoinScope,
  type ActivityStatus,
  type PaginatedResponse,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { loadCreatedActivities } from '@/lib/activity-drafts';

export interface UseActivitiesParams {
  scope: 'mine' | 'all';
  status?: ActivityStatus | ActivityStatus[];
  joinScope?: ActivityJoinScope;
  from?: string;
  to?: string;
  minParticipants?: number;
  maxParticipants?: number;
  page?: number;
  pageSize?: number;
}

const ActivityListSchema = paginatedResponseSchema(ActivitySchema);

export function activitiesQueryKey(params: UseActivitiesParams) {
  return ['activities', params] as const;
}

function buildSearchParams(
  params: UseActivitiesParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {
    scope: params.scope,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
  };
  if (params.status) {
    out.status = Array.isArray(params.status)
      ? params.status.join(',')
      : params.status;
  }
  if (params.joinScope) out.joinScope = params.joinScope;
  if (params.from) out.from = params.from;
  if (params.to) out.to = params.to;
  if (typeof params.minParticipants === 'number')
    out.minParticipants = params.minParticipants;
  if (typeof params.maxParticipants === 'number')
    out.maxParticipants = params.maxParticipants;
  return out;
}

// ─── Demo / Mock Data ────────────────────────────────────────────────────────

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '11111111-0000-4000-8000-000000000001',
    title: '周六川菜小聚 🌶️',
    description: '一起做麻婆豆腐和夫妻肺片，大家各带一道食材，欢迎新手！',
    startTime: '2026-04-26T11:30:00.000Z',
    location: '龙华街道幸福里小区 3 栋 B501',
    maxParticipants: 6,
    joinScope: 'STRANGERS_OK',
    status: 'WAITING_FOR_MEMBERS',
    createdBy: '00000000-0000-4000-8000-000000000001',
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000001',
    createdAt: '2026-04-20T08:00:00.000Z',
    updatedAt: '2026-04-20T08:00:00.000Z',
    participantCount: 3,
  },
  {
    id: '11111111-0000-4000-8000-000000000002',
    title: '日式拉面研习会 🍜',
    description: '从豚骨汤底开始，手工叉烧、溏心蛋一起来，预计 3 小时。',
    startTime: '2026-04-27T14:00:00.000Z',
    location: '南山区科技园创客中心 B2 共享厨房',
    maxParticipants: 4,
    joinScope: 'ACQUAINTANCES_ONLY',
    status: 'FORMED',
    createdBy: '00000000-0000-4000-8000-000000000001',
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000002',
    createdAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-21T09:15:00.000Z',
    participantCount: 4,
  },
  {
    id: '11111111-0000-4000-8000-000000000003',
    title: '粤式早茶复刻计划 ☕',
    description: '虾饺、肠粉、萝卜糕……一起把早茶搬回家，周日上午见！',
    startTime: '2026-04-28T08:00:00.000Z',
    location: '天河区华师地铁站附近，具体地址进群告知',
    maxParticipants: 8,
    joinScope: 'HIGH_TRUST_ONLY',
    status: 'STARTING_SOON',
    createdBy: '00000000-0000-4000-8000-000000000001',
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000003',
    createdAt: '2026-04-18T12:00:00.000Z',
    updatedAt: '2026-04-22T06:00:00.000Z',
    participantCount: 7,
  },
  {
    id: '11111111-0000-4000-8000-000000000004',
    title: '意式 Brunch 大赏 🥐',
    description: '卡布奇诺 + 班尼迪克蛋 + 提拉米苏，佛系周末从早餐开始。',
    startTime: '2026-04-22T09:00:00.000Z',
    location: '静安区愚园路咖啡公寓 4F',
    maxParticipants: 5,
    joinScope: 'STRANGERS_OK',
    status: 'COMPLETED',
    createdBy: '00000000-0000-4000-8000-000000000001',
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000004',
    createdAt: '2026-04-15T07:00:00.000Z',
    updatedAt: '2026-04-22T13:00:00.000Z',
    participantCount: 5,
  },
];

const MOCK_RESPONSE: PaginatedResponse<Activity> = {
  items: MOCK_ACTIVITIES,
  total: MOCK_ACTIVITIES.length,
  page: 1,
  pageSize: 20,
};

function withCreatedActivities(): PaginatedResponse<Activity> {
  const created = loadCreatedActivities();
  const items = [...created, ...MOCK_ACTIVITIES];
  return {
    items,
    total: items.length,
    page: 1,
    pageSize: 20,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export function useActivities(params: UseActivitiesParams) {
  return useQuery<PaginatedResponse<Activity>>({
    queryKey: activitiesQueryKey(params),
    queryFn: async () => {
      if (!isAuthed()) {
        return withCreatedActivities();
      }
      try {
        return ActivityListSchema.parse(
          await api
            .get('activities', { searchParams: buildSearchParams(params) })
            .json(),
        );
      } catch {
        return withCreatedActivities();
      }
    },
    enabled: true,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

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
    title: '周三晚 · 咖啡馆会员小程序拼桌 ☕',
    description: '独立咖啡馆主理人想做会员小程序，缺 React 和会员运营手感。来一桌把 MVP 撑起来。',
    startTime: '2026-04-26T11:30:00.000Z',
    location: '线上 · Zoom 1 小时 + 共享 Figma',
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
    title: '周末 · 独立播客主理人交换学 🎙️',
    description: '四个周更主播线下闭门：选题、剪辑、广告各教一招，外加把第二支节目脚本现场写出来。',
    startTime: '2026-04-27T14:00:00.000Z',
    location: '南山区科技园创客中心 B2 共享会议室',
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
    title: '周日上午 · 内容创作者互评工作坊 ✍️',
    description: '七位独立内容人各带一篇正在写的稿件，桌上互评互改，下午各自开新坑。',
    startTime: '2026-04-28T08:00:00.000Z',
    location: '天河区华师地铁站附近共享空间，具体地址进群告知',
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
    title: '复盘 · 咖啡馆会员小程序首桌已成局 ✅',
    description: '三人 OPC 周三晚拼了一桌，72 小时内交付了可点击原型，咖啡馆主理人已用上。',
    startTime: '2026-04-22T09:00:00.000Z',
    location: '线上 · Zoom + Figma 共享',
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
    // V3 demo: activities backend lives on a separate branch (`dev`). Until the
    // module-c controller is ported into develop, always serve mock data so the
    // /activities page renders cleanly instead of hitting a missing endpoint.
    queryFn: async () => withCreatedActivities(),
    enabled: true,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

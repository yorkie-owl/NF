'use client';

import { useQuery } from '@tanstack/react-query';
import type { ActivityDetail } from '@lin-shi/contracts';
import { useDocumentHidden } from '@/lib/visibility-pause';

export const activityDetailKey = (id: string) =>
  ['activities', 'detail', id] as const;

const DEMO_USER = {
  userId: '00000000-0000-4000-8000-000000000001',
  nickname: '小林',
  avatarUrl: null,
  joinedAt: '2026-04-20T08:00:00.000Z',
  leftAt: null,
};

// V3 demo: activities backend lives on the dev branch (module-c). Until ported
// into develop, serve a hand-rolled detail per known mock id so /activities/[id]
// renders without calling the missing endpoint.
const MOCK_DETAILS: ActivityDetail[] = [
  {
    id: '11111111-0000-4000-8000-000000000001',
    title: '周六川菜小聚 🌶️',
    description: '一起做麻婆豆腐和夫妻肺片，大家各带一道食材，欢迎新手！',
    startTime: '2026-04-26T11:30:00.000Z',
    location: '龙华街道幸福里小区 3 栋 B501',
    maxParticipants: 6,
    joinScope: 'STRANGERS_OK',
    status: 'WAITING_FOR_MEMBERS',
    createdBy: DEMO_USER.userId,
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000001',
    createdAt: '2026-04-20T08:00:00.000Z',
    updatedAt: '2026-04-20T08:00:00.000Z',
    participantCount: 3,
    participants: [
      DEMO_USER,
      { ...DEMO_USER, userId: '00000000-0000-4000-8000-000000000002', nickname: '阿强' },
      { ...DEMO_USER, userId: '00000000-0000-4000-8000-000000000003', nickname: '小美' },
    ],
    ingredients: [],
    manualIngredients: [
      { name: '豆腐', addedBy: DEMO_USER.userId, addedAt: '2026-04-20T08:05:00.000Z' },
      { name: '辣椒', addedBy: DEMO_USER.userId, addedAt: '2026-04-20T08:05:00.000Z' },
    ],
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
    createdBy: DEMO_USER.userId,
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000002',
    createdAt: '2026-04-19T10:00:00.000Z',
    updatedAt: '2026-04-21T09:15:00.000Z',
    participantCount: 4,
    participants: [
      DEMO_USER,
      { ...DEMO_USER, userId: '00000000-0000-4000-8000-000000000004', nickname: '小田' },
      { ...DEMO_USER, userId: '00000000-0000-4000-8000-000000000005', nickname: '大山' },
      { ...DEMO_USER, userId: '00000000-0000-4000-8000-000000000006', nickname: 'Lily' },
    ],
    ingredients: [],
    manualIngredients: [
      { name: '猪骨', addedBy: DEMO_USER.userId, addedAt: '2026-04-19T10:05:00.000Z' },
    ],
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
    createdBy: DEMO_USER.userId,
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000003',
    createdAt: '2026-04-18T12:00:00.000Z',
    updatedAt: '2026-04-22T06:00:00.000Z',
    participantCount: 7,
    participants: Array.from({ length: 7 }, (_, i) => ({
      ...DEMO_USER,
      userId: `00000000-0000-4000-8000-${String(i + 10).padStart(12, '0')}`,
      nickname: `早茶${i + 1}号`,
    })),
    ingredients: [],
    manualIngredients: [],
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
    createdBy: DEMO_USER.userId,
    chatRoomId: 'aaaaaaaa-0000-4000-8000-000000000004',
    createdAt: '2026-04-15T07:00:00.000Z',
    updatedAt: '2026-04-22T13:00:00.000Z',
    participantCount: 5,
    participants: Array.from({ length: 5 }, (_, i) => ({
      ...DEMO_USER,
      userId: `00000000-0000-4000-8000-${String(i + 20).padStart(12, '0')}`,
      nickname: `Brunch${i + 1}`,
    })),
    ingredients: [],
    manualIngredients: [],
  },
];

function loadCreatedDetail(id: string): ActivityDetail | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const raw = window.localStorage.getItem('lin-shi.created-activities');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;
    return (parsed as ActivityDetail[]).find((a) => a.id === id);
  } catch {
    return undefined;
  }
}

export function useActivity(id: string | undefined) {
  const hidden = useDocumentHidden();
  return useQuery<ActivityDetail>({
    queryKey: activityDetailKey(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('missing id');
      const created = loadCreatedDetail(id);
      if (created) return created;
      const mock = MOCK_DETAILS.find((a) => a.id === id);
      if (mock) return mock;
      throw new Error('activity not found');
    },
    enabled: Boolean(id),
    refetchInterval: (q) => {
      if (hidden) return false;
      const status = q.state.data?.status;
      if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      return false; // mock data, no need to poll
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    retry: false,
  });
}

import type {
  FoodPreferences,
  FriendPreferences,
  InviteCodeDetail,
  UserBadge,
  UserPrivate,
} from '@lin-shi/contracts';

export const DEMO_USER: UserPrivate = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'demo@linshi.local',
  nickname: '邻食体验用户',
  avatarUrl: null,
  school: '上海',
  city: '上海',
  bio: '喜欢把冰箱里的食材变成一顿邻里饭。',
  badges: ['TASTE_EXPLORER', 'HEALTHY_LIFE'],
  credit: 100,
  createdAt: '2026-04-01T00:00:00.000Z',
  lastLoginAt: '2026-04-22T08:00:00.000Z',
};

export const DEMO_FRIEND_PREFERENCES: FriendPreferences = {
  acceptStrangers: true,
  distanceKm: 3,
  timeSlots: [
    { dayOfWeek: 6, startHour: 18, endHour: 22 },
    { dayOfWeek: 7, startHour: 11, endHour: 15 },
  ],
};

export const DEMO_FOOD_PREFERENCES: FoodPreferences = {
  cuisines: ['SICHUAN', 'CANTONESE'],
  dietaryRestrictions: [],
  cookingSkill: 'INTERMEDIATE',
};

export const DEMO_INVITE_CODE: InviteCodeDetail = {
  code: 'LINSHI88',
  maxUses: 5,
  usesRemaining: 5,
  redemptions: [],
};

export const DEMO_BADGES: UserBadge[] = [
  { code: 'TASTE_EXPLORER', earnedAt: '2026-04-10T08:00:00.000Z' },
  { code: 'HEALTHY_LIFE', earnedAt: '2026-04-12T08:00:00.000Z' },
];

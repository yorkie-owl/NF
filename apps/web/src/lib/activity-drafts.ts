import type { Activity, ActivityDetail, CreateActivityRequest } from '@lin-shi/contracts';

const STORAGE_KEY = 'lin-shi.created-activities';
const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function loadCreatedActivities(): Activity[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Activity[]) : [];
  } catch {
    return [];
  }
}

export function saveCreatedActivity(payload: CreateActivityRequest): ActivityDetail {
  const now = new Date().toISOString();
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `11111111-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`;
  const activity: ActivityDetail = {
    id,
    title: payload.title,
    description: payload.description ?? null,
    startTime: payload.startTime,
    location: payload.location,
    maxParticipants: payload.maxParticipants,
    joinScope: payload.joinScope,
    status: 'WAITING_FOR_MEMBERS',
    createdBy: DEMO_USER_ID,
    chatRoomId: id,
    createdAt: now,
    updatedAt: now,
    participantCount: 1,
    participants: [
      {
        userId: DEMO_USER_ID,
        nickname: '邻食体验用户',
        avatarUrl: null,
        joinedAt: now,
        leftAt: null,
      },
    ],
    ingredients: [],
    manualIngredients: payload.manualIngredients.map((name) => ({
      name,
      addedBy: DEMO_USER_ID,
      addedAt: now,
    })),
  };

  const next = [activity, ...loadCreatedActivities()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return activity;
}

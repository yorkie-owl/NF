'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FriendPreferencesSchema,
  type FriendPreferences,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { DEMO_FRIEND_PREFERENCES } from '@/lib/demo-data';

const FRIEND_PREF_KEY = ['me', 'preferences', 'friend'] as const;

export function useFriendPreferences() {
  return useQuery<FriendPreferences>({
    queryKey: FRIEND_PREF_KEY,
    queryFn: async () => {
      if (!isAuthed()) return DEMO_FRIEND_PREFERENCES;
      try {
        return FriendPreferencesSchema.parse(
          await api.get('me/preferences/friend').json(),
        );
      } catch {
        return DEMO_FRIEND_PREFERENCES;
      }
    },
    retry: false,
    enabled: true,
  });
}

export function useUpdateFriendPreferences() {
  const qc = useQueryClient();
  return useMutation<FriendPreferences, Error, FriendPreferences>({
    mutationFn: async (payload) => {
      try {
        if (!isAuthed()) throw new Error('Not authed');
        return FriendPreferencesSchema.parse(
          await api.put('me/preferences/friend', { json: payload }).json(),
        );
      } catch (err) {
        console.warn('Friend preferences update failed, falling back to mock:', err);
        await new Promise((r) => setTimeout(r, 500));
        return payload;
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(FRIEND_PREF_KEY, data);
    },
  });
}

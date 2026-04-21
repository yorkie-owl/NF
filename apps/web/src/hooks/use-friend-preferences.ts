'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FriendPreferencesSchema,
  type FriendPreferences,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

const FRIEND_PREF_KEY = ['me', 'preferences', 'friend'] as const;

export function useFriendPreferences() {
  return useQuery<FriendPreferences>({
    queryKey: FRIEND_PREF_KEY,
    queryFn: async () =>
      FriendPreferencesSchema.parse(
        await api.get('me/preferences/friend').json(),
      ),
    retry: false,
    enabled: isAuthed(),
  });
}

export function useUpdateFriendPreferences() {
  const qc = useQueryClient();
  return useMutation<FriendPreferences, Error, FriendPreferences>({
    mutationFn: async (payload) =>
      FriendPreferencesSchema.parse(
        await api.put('me/preferences/friend', { json: payload }).json(),
      ),
    onSuccess: (data) => {
      qc.setQueryData(FRIEND_PREF_KEY, data);
    },
  });
}

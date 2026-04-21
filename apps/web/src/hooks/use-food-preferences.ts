'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FoodPreferencesSchema,
  type FoodPreferences,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';

const FOOD_PREF_KEY = ['me', 'preferences', 'food'] as const;

export function useFoodPreferences() {
  return useQuery<FoodPreferences>({
    queryKey: FOOD_PREF_KEY,
    queryFn: async () =>
      FoodPreferencesSchema.parse(
        await api.get('me/preferences/food').json(),
      ),
    retry: false,
    enabled: isAuthed(),
  });
}

export function useUpdateFoodPreferences() {
  const qc = useQueryClient();
  return useMutation<FoodPreferences, Error, FoodPreferences>({
    mutationFn: async (payload) =>
      FoodPreferencesSchema.parse(
        await api.put('me/preferences/food', { json: payload }).json(),
      ),
    onSuccess: (data) => {
      qc.setQueryData(FOOD_PREF_KEY, data);
    },
  });
}

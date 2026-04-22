'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FoodPreferencesSchema,
  type FoodPreferences,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { DEMO_FOOD_PREFERENCES } from '@/lib/demo-data';

const FOOD_PREF_KEY = ['me', 'preferences', 'food'] as const;

export function useFoodPreferences() {
  return useQuery<FoodPreferences>({
    queryKey: FOOD_PREF_KEY,
    queryFn: async () => {
      if (!isAuthed()) return DEMO_FOOD_PREFERENCES;
      try {
        return FoodPreferencesSchema.parse(
          await api.get('me/preferences/food').json(),
        );
      } catch {
        return DEMO_FOOD_PREFERENCES;
      }
    },
    retry: false,
    enabled: true,
  });
}

export function useUpdateFoodPreferences() {
  const qc = useQueryClient();
  return useMutation<FoodPreferences, Error, FoodPreferences>({
    mutationFn: async (payload) => {
      try {
        if (!isAuthed()) throw new Error('Not authed');
        return FoodPreferencesSchema.parse(
          await api.put('me/preferences/food', { json: payload }).json(),
        );
      } catch (err) {
        console.warn('Food preferences update failed, falling back to mock:', err);
        await new Promise((r) => setTimeout(r, 500));
        return payload;
      }
    },
    onSuccess: (data) => {
      qc.setQueryData(FOOD_PREF_KEY, data);
    },
  });
}

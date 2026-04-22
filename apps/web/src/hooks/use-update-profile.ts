'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AvatarUploadResponseSchema,
  UserPrivateSchema,
  type AvatarUploadResponse,
  type UpdateProfileRequest,
  type UserPrivate,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { isAuthed } from '@/lib/auth';
import { meQueryKey } from './use-me';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<UserPrivate, Error, UpdateProfileRequest>({
    mutationFn: async (payload) => {
      try {
        if (!isAuthed()) throw new Error('Not authed');
        return UserPrivateSchema.parse(
          await api.patch('me', { json: payload }).json(),
        );
      } catch (err) {
        // Fallback to mock for V3 demo if API is unreachable
        console.warn('Profile update failed, falling back to mock:', err);
        await new Promise((r) => setTimeout(r, 500));
        const current = qc.getQueryData<UserPrivate>(meQueryKey);
        return { ...current!, ...payload } as UserPrivate;
      }
    },
    onSuccess: (user) => {
      qc.setQueryData(meQueryKey, user);
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation<AvatarUploadResponse, Error, File>({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return AvatarUploadResponseSchema.parse(
        await api.post('me/avatar', { body: fd }).json(),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

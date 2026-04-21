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
import { meQueryKey } from './use-me';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<UserPrivate, Error, UpdateProfileRequest>({
    mutationFn: async (payload) =>
      UserPrivateSchema.parse(
        await api.patch('me', { json: payload }).json(),
      ),
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

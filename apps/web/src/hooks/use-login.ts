'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AuthResponseSchema,
  type AuthResponse,
  type LoginRequest,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { onAuthSuccess } from '@/lib/auth';

export function useLogin() {
  const qc = useQueryClient();
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: async (payload) =>
      AuthResponseSchema.parse(
        await api.post('auth/login', { json: payload }).json(),
      ),
    onSuccess: (data) => onAuthSuccess(qc, data),
  });
}

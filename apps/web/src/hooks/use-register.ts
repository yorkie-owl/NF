'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AuthResponseSchema,
  type AuthResponse,
  type RegisterRequest,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { onAuthSuccess } from '@/lib/auth';

export function useRegister() {
  const qc = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (payload) =>
      AuthResponseSchema.parse(
        await api.post('auth/register', { json: payload }).json(),
      ),
    onSuccess: (data) => onAuthSuccess(qc, data),
  });
}

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AuthResponseSchema,
  type AuthResponse,
  type RegisterRequest,
} from '@lin-shi/contracts';
import { api } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import { meQueryKey } from './use-me';

export function useRegister() {
  const qc = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: async (payload) =>
      AuthResponseSchema.parse(
        await api.post('auth/register', { json: payload }).json(),
      ),
    onSuccess: (data) => {
      setTokens({
        access: data.tokens.accessToken,
        refresh: data.tokens.refreshToken,
      });
      qc.setQueryData(meQueryKey, data.user);
    },
  });
}

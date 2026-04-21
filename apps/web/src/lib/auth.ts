import type { QueryClient } from '@tanstack/react-query';
import type { AuthResponse } from '@lin-shi/contracts';
import { meQueryKey } from '@/hooks/use-me';

const ACCESS_KEY = 'lin-shi.access';
const REFRESH_KEY = 'lin-shi.refresh';

function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

export function getAccessToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!hasWindow()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(tokens: { access: string; refresh: string }): void {
  if (!hasWindow()) return;
  window.localStorage.setItem(ACCESS_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  if (!hasWindow()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

/**
 * Returns `true` when an access token is present in this browser session.
 * Safe to call during SSR — falls back to `false` when `window` is absent.
 * Use in React Query `enabled:` options to gate authenticated queries.
 */
export function isAuthed(): boolean {
  return hasWindow() && Boolean(getAccessToken());
}

/**
 * Persist tokens + prime the `me` query cache after a successful auth flow.
 * Shared between `useLogin` and `useRegister`.
 */
export function onAuthSuccess(qc: QueryClient, data: AuthResponse): void {
  setTokens({ access: data.tokens.accessToken, refresh: data.tokens.refreshToken });
  qc.setQueryData(meQueryKey, data.user);
}

import ky, { HTTPError } from 'ky';
import { ApiErrorSchema } from '@lin-shi/contracts';
import { env } from './env';
import { getAccessToken } from './auth';

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  retry: 0,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = getAccessToken();
        if (token) request.headers.set('Authorization', `Bearer ${token}`);
      },
    ],
  },
});

/**
 * Extract { code, message } from any error. The server returns the flat
 * `ApiError` envelope declared in `packages/contracts/common/error.ts`
 * (see TEAM-CONTRACT §4.3). Always returns a usable shape — falls back
 * to UNKNOWN when the body can't be parsed.
 */
export async function extractApiError(
  err: unknown,
): Promise<{ code: string; message: string }> {
  if (err instanceof HTTPError) {
    try {
      const body: unknown = await err.response.clone().json();
      const parsed = ApiErrorSchema.safeParse(body);
      if (parsed.success) {
        return { code: parsed.data.code, message: parsed.data.message };
      }
    } catch {
      /* fall through */
    }
  }
  return {
    code: 'UNKNOWN',
    message: err instanceof Error ? err.message : '未知错误',
  };
}

export { HTTPError };

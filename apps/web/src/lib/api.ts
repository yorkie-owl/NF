import ky, { HTTPError } from 'ky';
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

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

/**
 * Extract { code, message } from ky HTTPError. API returns:
 *   { error: { code: string, message: string, details?: unknown } }
 * (see TEAM-CONTRACT §4.x). Returns null if not an HTTPError.
 */
export async function extractApiError(err: unknown): Promise<ApiError | null> {
  if (!(err instanceof HTTPError)) return null;
  try {
    const body = (await err.response.clone().json()) as {
      error?: { code?: unknown; message?: unknown };
    };
    const code =
      typeof body.error?.code === 'string' ? body.error.code : 'UNKNOWN';
    const message =
      typeof body.error?.message === 'string'
        ? body.error.message
        : err.message;
    return { code, message, status: err.response.status };
  } catch {
    return { code: 'UNKNOWN', message: err.message, status: err.response.status };
  }
}

export { HTTPError };

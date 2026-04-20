import ky from 'ky';
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

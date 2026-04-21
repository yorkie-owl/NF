import { INVITE_CODE_REGEX } from '@lin-shi/contracts';

export { INVITE_CODE_REGEX };

export function isValidInviteCode(raw: string): boolean {
  return INVITE_CODE_REGEX.test(raw.trim().toUpperCase());
}

export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export type TimeQuickOptionId =
  | 'tonight'
  | 'tomorrowNight'
  | 'thisWeekend'
  | 'nextWeekend'
  | 'custom';

export interface TimeQuickOption {
  id: TimeQuickOptionId;
  label: string;
}

export const TIME_QUICK_OPTIONS: ReadonlyArray<TimeQuickOption> = [
  { id: 'tonight', label: '今晚' },
  { id: 'tomorrowNight', label: '明晚' },
  { id: 'thisWeekend', label: '本周末' },
  { id: 'nextWeekend', label: '下周末' },
  { id: 'custom', label: '自定义' },
];

/**
 * Return a Date at 19:00 local for the given option id.
 *
 * - tonight: today 19:00 (even if already past — server will reject with
 *   ACTIVITY_START_IN_PAST, which is the intended UX).
 * - tomorrowNight: tomorrow 19:00.
 * - thisWeekend: the *coming* Saturday 19:00 (if today is Sat, that same day).
 * - nextWeekend: the Saturday of the following week.
 * - custom: returns null (caller shows datetime-local input).
 */
export function quickOptionToDate(
  id: TimeQuickOptionId,
  now: Date = new Date(),
): Date | null {
  if (id === 'custom') return null;
  const base = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    19,
    0,
    0,
    0,
  );
  if (id === 'tonight') return base;
  if (id === 'tomorrowNight')
    return new Date(base.getTime() + 86400000);
  if (id === 'thisWeekend') {
    // 0 Sun, 6 Sat. Pick the nearest upcoming Saturday (today counts if Sat).
    const dow = base.getDay();
    const daysToSat = (6 - dow + 7) % 7;
    return new Date(base.getTime() + daysToSat * 86400000);
  }
  // nextWeekend — Saturday of the next calendar week
  const dow = base.getDay();
  const daysToNextSat = ((6 - dow + 7) % 7) + 7;
  return new Date(base.getTime() + daysToNextSat * 86400000);
}

/**
 * Format a Date as value for <input type="datetime-local"> in local time:
 * "YYYY-MM-DDTHH:mm". No timezone suffix — native input is naive local.
 */
export function toDatetimeLocalValue(d: Date): string {
  const yyyy = d.getFullYear().toString().padStart(4, '0');
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const hh = d.getHours().toString().padStart(2, '0');
  const mi = d.getMinutes().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/**
 * Parse a value from <input type="datetime-local"> (local time, no tz)
 * into a real Date. Returns null if invalid.
 */
export function fromDatetimeLocalValue(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

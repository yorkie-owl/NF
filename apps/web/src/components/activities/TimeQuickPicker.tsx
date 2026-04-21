'use client';

import {
  TIME_QUICK_OPTIONS,
  fromDatetimeLocalValue,
  quickOptionToDate,
  toDatetimeLocalValue,
  type TimeQuickOptionId,
} from '@/lib/time-quick-picker';
import { cn } from '@/lib/cn';

export interface TimeQuickPickerProps {
  selected: TimeQuickOptionId;
  customValue: string;
  onSelect: (id: TimeQuickOptionId) => void;
  onCustomChange: (value: string) => void;
}

/**
 * Controlled quick-picker. Parent owns `selected` + `customValue`.
 * When selected = 'custom', an `<input type="datetime-local">` is rendered.
 * Caller derives the final ISO via `resolveTimeQuickPicker(...)` below.
 */
export function TimeQuickPicker({
  selected,
  customValue,
  onSelect,
  onCustomChange,
}: TimeQuickPickerProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TIME_QUICK_OPTIONS.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              aria-pressed={active}
              className={cn(
                'inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
                active
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {selected === 'custom' ? (
        <input
          type="datetime-local"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          className="mt-3 h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-[15px] text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-400/60"
        />
      ) : null}
    </div>
  );
}

/**
 * Resolve the picker's current value to an ISO string, or `null` if unresolvable
 * (custom option selected but input empty / invalid).
 */
export function resolveTimeQuickPicker(
  selected: TimeQuickOptionId,
  customValue: string,
): string | null {
  if (selected === 'custom') {
    const d = fromDatetimeLocalValue(customValue);
    return d ? d.toISOString() : null;
  }
  const d = quickOptionToDate(selected);
  return d ? d.toISOString() : null;
}

/** Initial placeholder value for the custom input, anchored to tomorrow 19:00. */
export function initialCustomValue(now: Date = new Date()): string {
  const tomorrow = new Date(now.getTime() + 86400000);
  tomorrow.setHours(19, 0, 0, 0);
  return toDatetimeLocalValue(tomorrow);
}

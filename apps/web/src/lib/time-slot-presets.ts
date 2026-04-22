import type { TimeSlot } from '@lin-shi/contracts';

/**
 * 6 preset time-slot bundles. Each preset expands to a flat list of
 * `TimeSlot` objects (one per day-of-week covered).
 *
 * Day mapping: 1=Mon, 2=Tue, ..., 6=Sat, 7=Sun.
 */
export type TimeSlotPresetId =
  | 'weekday_morning'
  | 'weekday_day'
  | 'weekday_night'
  | 'weekend_morning'
  | 'weekend_day'
  | 'weekend_all';

export interface TimeSlotPreset {
  id: TimeSlotPresetId;
  label: string;
  days: number[];
  startHour: number;
  endHour: number;
}

export const TIME_SLOT_PRESETS: TimeSlotPreset[] = [
  {
    id: 'weekday_morning',
    label: '工作日早上',
    days: [1, 2, 3, 4, 5],
    startHour: 6,
    endHour: 9,
  },
  {
    id: 'weekday_day',
    label: '工作日白天',
    days: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 18,
  },
  {
    id: 'weekday_night',
    label: '工作日晚上',
    days: [1, 2, 3, 4, 5],
    startHour: 18,
    endHour: 23,
  },
  {
    id: 'weekend_morning',
    label: '周末早上',
    days: [6, 7],
    startHour: 6,
    endHour: 9,
  },
  {
    id: 'weekend_day',
    label: '周末白天',
    days: [6, 7],
    startHour: 9,
    endHour: 18,
  },
  {
    id: 'weekend_all',
    label: '周末全天',
    days: [6, 7],
    startHour: 6,
    endHour: 24,
  },
];

export function expandPresets(selectedIds: TimeSlotPresetId[]): TimeSlot[] {
  const out: TimeSlot[] = [];
  for (const id of selectedIds) {
    const preset = TIME_SLOT_PRESETS.find((p) => p.id === id);
    if (!preset) continue;
    for (const day of preset.days) {
      out.push({
        dayOfWeek: day,
        startHour: preset.startHour,
        endHour: preset.endHour,
      });
    }
  }
  return out;
}

/**
 * Best-effort inverse: given a TimeSlot list, find which presets fully match.
 * If a slot doesn't match any preset it's simply ignored for UI purposes.
 */
export function detectPresets(slots: TimeSlot[]): TimeSlotPresetId[] {
  const selected: TimeSlotPresetId[] = [];
  for (const preset of TIME_SLOT_PRESETS) {
    const allDaysCovered = preset.days.every((day) =>
      slots.some(
        (s) =>
          s.dayOfWeek === day &&
          s.startHour === preset.startHour &&
          s.endHour === preset.endHour,
      ),
    );
    if (allDaysCovered) selected.push(preset.id);
  }
  return selected;
}

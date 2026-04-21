'use client';

import { Chip } from '@/components/ui/chip';
import {
  TIME_SLOT_PRESETS,
  type TimeSlotPresetId,
} from '@/lib/time-slot-presets';

export interface TimeSlotPickerProps {
  value: TimeSlotPresetId[];
  onChange: (next: TimeSlotPresetId[]) => void;
}

export function TimeSlotPicker({ value, onChange }: TimeSlotPickerProps) {
  const toggle = (id: TimeSlotPresetId) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {TIME_SLOT_PRESETS.map((preset) => {
        const selected = value.includes(preset.id);
        return (
          <Chip
            key={preset.id}
            selected={selected}
            tone="brand"
            onClick={() => toggle(preset.id)}
            aria-pressed={selected}
          >
            {preset.label}
          </Chip>
        );
      })}
    </div>
  );
}

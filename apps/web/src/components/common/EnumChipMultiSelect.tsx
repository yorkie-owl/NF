'use client';

import { Chip, type ChipTone } from '@/components/ui/chip';
import { toast } from '@/lib/toast';

export interface EnumChipOption<T extends string> {
  value: T;
  label: string;
}

export interface EnumChipMultiSelectProps<T extends string> {
  options: EnumChipOption<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  max?: number;
  tone?: ChipTone;
}

export function EnumChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
  max,
  tone = 'brand',
}: EnumChipMultiSelectProps<T>) {
  const toggle = (v: T) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
      return;
    }
    if (max !== undefined && value.length >= max) {
      toast.info(`最多选 ${max} 个`);
      return;
    }
    onChange([...value, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <Chip
            key={opt.value}
            selected={selected}
            tone={tone}
            onClick={() => toggle(opt.value)}
            aria-pressed={selected}
          >
            {opt.label}
          </Chip>
        );
      })}
    </div>
  );
}

export interface EnumChipSingleSelectProps<T extends string> {
  options: EnumChipOption<T>[];
  value: T | null;
  onChange: (next: T) => void;
  tone?: ChipTone;
}

export function EnumChipSingleSelect<T extends string>({
  options,
  value,
  onChange,
  tone = 'brand',
}: EnumChipSingleSelectProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <Chip
          key={opt.value}
          selected={value === opt.value}
          tone={tone}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </Chip>
      ))}
    </div>
  );
}

'use client';

import type { ChangeEvent } from 'react';
import { cn } from '@/lib/cn';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  'aria-label': string;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  'aria-label': ariaLabel,
  className,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (!Number.isNaN(next)) onChange(next);
  };
  return (
    <div className={cn('relative w-full touch-none py-2', className)}>
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-neutral-200" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-cta"
        style={{ width: `${pct}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handle}
        aria-label={ariaLabel}
        className={cn(
          'relative z-10 h-6 w-full cursor-pointer appearance-none bg-transparent',
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
          '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500',
          '[&::-webkit-slider-thumb]:shadow',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5',
          '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
          '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-500',
        )}
      />
    </div>
  );
}

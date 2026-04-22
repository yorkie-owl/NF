'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ChipTone = 'brand' | 'peach' | 'neutral' | 'success' | 'warning';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  tone?: ChipTone;
  icon?: ReactNode;
  as?: 'button' | 'span';
}

const toneSelected: Record<ChipTone, string> = {
  brand: 'bg-brand-200 text-brand-700 border-brand-200',
  peach: 'bg-accent-peach-400/30 text-neutral-900 border-accent-peach-400/40',
  neutral: 'bg-neutral-900 text-white border-neutral-900',
  success: 'bg-success-100 text-neutral-900 border-success-100',
  warning: 'bg-warning-100 text-neutral-900 border-warning-100',
};

export function Chip({
  selected = false,
  tone = 'brand',
  icon,
  className,
  children,
  as = 'button',
  type,
  ...rest
}: ChipProps) {
  const baseCls = cn(
    'inline-flex items-center gap-1 rounded-full border px-3 py-1.5',
    'text-[12px] font-medium leading-4 transition-colors',
    selected
      ? toneSelected[tone]
      : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200',
    as === 'button' &&
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60',
    className,
  );

  if (as === 'span') {
    return (
      <span className={baseCls}>
        {icon}
        {children}
      </span>
    );
  }
  return (
    <button type={type ?? 'button'} className={baseCls} {...rest}>
      {icon}
      {children}
    </button>
  );
}

import type { LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Label({
  className,
  ...rest
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'block text-[14px] font-medium text-neutral-700',
        className,
      )}
      {...rest}
    />
  );
}

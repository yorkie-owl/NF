'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const button = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-semibold text-[16px] leading-6',
    'transition-transform duration-150 active:scale-[0.98]',
    'disabled:opacity-50 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 focus-visible:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-brand-500 text-white rounded-full shadow-glow-primary hover:bg-brand-600',
        gradient:
          'bg-gradient-cta text-white rounded-full shadow-glow-primary hover:opacity-95',
        secondary:
          'bg-white text-neutral-900 rounded-full border border-neutral-200 hover:bg-neutral-50',
        ghost:
          'bg-transparent text-neutral-700 rounded-full hover:bg-neutral-100',
        danger:
          'bg-danger-500 text-white rounded-full hover:opacity-95',
      },
      size: {
        sm: 'h-9 px-4 text-[14px]',
        md: 'h-11 px-5',
        lg: 'h-12 px-6',
        xl: 'h-14 px-6 text-[17px]',
      },
      full: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'lg',
      full: false,
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, full, type, ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type ?? 'button'}
        className={cn(button({ variant, size, full }), className)}
        {...rest}
      />
    );
  },
);

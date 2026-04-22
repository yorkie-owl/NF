import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-lg border bg-neutral-100 px-4 text-[16px] text-neutral-900',
        'placeholder:text-neutral-400',
        'focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/60',
        invalid
          ? 'border-danger-500 focus:ring-danger-500/50'
          : 'border-transparent',
        className,
      )}
      {...rest}
    />
  );
});

'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import Link from 'next/link';
import { scalePressIn } from '@/components/motion/presets';
import { cn } from '@/lib/cn';

export interface PotButtonProps {
  href: string;
  label?: string;
  className?: string;
}

/**
 * Central raised CTA in the bottom nav. 56×56 gradient circle lifted -16px.
 * Uses scalePressIn motion on press.
 */
export function PotButton({ href, label = '起锅', className }: PotButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'group flex flex-col items-center gap-0.5 text-[11px] font-medium text-brand-500',
        className,
      )}
    >
      <motion.span
        whileTap={{ scale: 0.96 }}
        transition={scalePressIn}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full text-white',
          'bg-gradient-cta shadow-glow-primary -mt-6',
        )}
      >
        <Flame className="h-6 w-6" aria-hidden />
      </motion.span>
      <span>{label}</span>
    </Link>
  );
}

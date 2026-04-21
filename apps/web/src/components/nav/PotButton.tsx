'use client';

import { motion } from 'framer-motion';
import { CookingPot } from 'lucide-react';
import Link from 'next/link';
import { scalePressIn } from '@/components/motion/presets';
import { cn } from '@/lib/cn';

export interface PotButtonProps {
  href: string;
  label?: string;
  className?: string;
}

/**
 * Central raised CTA for the bottom nav. 56×56 coral-pink circle sitting
 * inside the nav's arch cutout (see BottomNav SVG). Lifts -20px above the
 * nav baseline so the button crown peeks above the arch.
 */
export function PotButton({ href, label = '准备起锅', className }: PotButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'group flex flex-col items-center gap-1 text-[11px] font-medium text-brand-500',
        className,
      )}
    >
      <motion.span
        whileTap={{ scale: 0.94 }}
        transition={scalePressIn}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full text-white',
          'bg-gradient-to-br from-brand-400 to-brand-500',
          'shadow-glow-primary ring-4 ring-white -mt-8',
        )}
      >
        <CookingPot className="h-6 w-6" aria-hidden strokeWidth={2.2} />
      </motion.span>
      <span>{label}</span>
    </Link>
  );
}

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
export function PotButton({ href, label = '立局', className }: PotButtonProps) {
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
          'flex h-[72px] w-[72px] items-center justify-center rounded-full text-white',
          'bg-gradient-to-br from-brand-400 to-brand-500',
          'shadow-glow-primary -mt-6',
        )}
      >
        <CookingPot className="h-7 w-7" aria-hidden strokeWidth={2.2} />
      </motion.span>
      <span className="text-brand-500">{label}</span>
    </Link>
  );
}

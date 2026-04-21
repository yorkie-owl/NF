'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactNode } from 'react';
import { refrigeratorMaskClip } from './presets';

export interface RefrigeratorMaskProps {
  /** Whether the overlay is showing. */
  open: boolean;
  /** Viewport X origin for the expand circle (px). */
  originX: number;
  /** Viewport Y origin for the expand circle (px). */
  originY: number;
  /** Fires ~1.1s after opening — typically where the caller navigates. */
  onFinished?: () => void;
  children?: ReactNode;
}

/**
 * Circular clipPath expand for fridge→detail transitions.
 * Scaffold component — not wired into a flow in MVP per task brief.
 */
export function RefrigeratorMask({
  open,
  originX,
  originY,
  onFinished,
  children,
}: RefrigeratorMaskProps) {
  useEffect(() => {
    if (!open || !onFinished) return;
    const t = window.setTimeout(onFinished, 1100);
    return () => window.clearTimeout(t);
  }, [open, onFinished]);

  const clip = refrigeratorMaskClip(originX, originY);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[70] bg-gradient-warm"
          initial={clip.initial}
          animate={clip.animate}
          exit={{ opacity: 0 }}
          transition={clip.transition}
          aria-hidden
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

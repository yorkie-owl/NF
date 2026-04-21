import type { Transition, Variants } from 'framer-motion';

/**
 * Shared motion presets — design-system §6.
 * Framer Motion respects `prefers-reduced-motion` via MotionConfig,
 * but we also keep the durations short (<= 0.35s) to stay snappy.
 */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInUpTransition: Transition = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1],
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

export const scalePressIn: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
};

export const ingredientWalkOut: Variants = {
  rest: { x: 0, y: 0, opacity: 1, rotate: 0 },
  walkOut: {
    x: 120,
    y: -80,
    opacity: 0,
    rotate: 18,
    transition: { duration: 0.8, ease: [0.6, 0, 0.4, 1] },
  },
};

/**
 * Fridge-mask expand: clipPath circle growing from target origin to full screen.
 * Consumer passes `originX` / `originY` (px from viewport top-left).
 */
export function refrigeratorMaskClip(
  originX: number,
  originY: number,
): { initial: Record<string, string>; animate: Record<string, string>; transition: Transition } {
  return {
    initial: { clipPath: `circle(0px at ${originX}px ${originY}px)` },
    animate: { clipPath: `circle(150vmax at ${originX}px ${originY}px)` },
    transition: { duration: 1.1, ease: [0.6, 0, 0.4, 1] },
  };
}

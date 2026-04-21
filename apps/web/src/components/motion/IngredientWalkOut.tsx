'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ingredientWalkOut } from './presets';

export interface IngredientWalkOutProps {
  /** When toggled to true, the chip will animate out (top-right trajectory). */
  walkOut: boolean;
  children: ReactNode;
}

/**
 * Wrap any chip / badge node — when `walkOut` flips true it flies up-right
 * while fading. Intended for "食材出走" (ingredient leaves the fridge).
 */
export function IngredientWalkOut({ walkOut, children }: IngredientWalkOutProps) {
  return (
    <motion.span
      className="inline-flex"
      variants={ingredientWalkOut}
      initial="rest"
      animate={walkOut ? 'walkOut' : 'rest'}
    >
      {children}
    </motion.span>
  );
}

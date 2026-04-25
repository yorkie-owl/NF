'use client';

import { motion } from 'framer-motion';
import { RESTLESS_THRESHOLD } from '@/lib/restlessness';

type Props = {
  /** 0..100 */
  value: number;
  /** 视觉直径 px */
  size?: number;
  className?: string;
};

const STROKE = 2;

export function RestlessnessRing({ value, size = 16, className }: Props) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - STROKE) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v / 100);
  const restless = v >= RESTLESS_THRESHOLD;
  const stroke = restless ? '#fb7185' : v >= 60 ? '#f97316' : '#a3a3a3';

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      animate={restless ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={restless ? { repeat: Infinity, duration: 0.9, ease: 'easeInOut' } : { duration: 0 }}
      aria-label={`躁动 ${v}%`}
      role="img"
    >
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(0,0,0,0.06)" strokeWidth={STROKE} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={stroke}
        strokeWidth={STROKE}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </motion.svg>
  );
}

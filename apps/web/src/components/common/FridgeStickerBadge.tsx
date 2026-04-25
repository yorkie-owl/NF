'use client';

import { Clock, Flame, Leaf, Sparkles, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface BadgeVisual {
  icon: LucideIcon;
  gradient: string; // Tailwind bg-gradient-* utility or inline gradient class
  chineseName: string;
}

// Canonical 4 badges. Mirrors DECISIONS-2026-04-20 §5.
const BADGE_VISUALS: Record<string, BadgeVisual> = {
  taste_master: {
    icon: Sparkles,
    gradient: 'bg-gradient-invite',
    chineseName: '风格达人',
  },
  healthy_life: {
    icon: Leaf,
    gradient: 'bg-gradient-fresh',
    chineseName: '健康生活',
  },
  warm_host: {
    icon: Flame,
    gradient: 'bg-gradient-cta',
    chineseName: '热情房主',
  },
  punctual_diner: {
    icon: Clock,
    gradient: 'bg-gradient-cool',
    chineseName: '准时达人',
  },
};

export const BADGE_CODES = Object.keys(BADGE_VISUALS);

export interface FridgeStickerBadgeProps {
  code: string;
  earned: boolean;
}

export function FridgeStickerBadge({ code, earned }: FridgeStickerBadgeProps) {
  const visual = BADGE_VISUALS[code];
  if (!visual) return null;
  const Icon = visual.icon;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl shadow',
          earned ? visual.gradient : 'bg-neutral-100',
        )}
        aria-label={visual.chineseName}
      >
        <Icon
          className={cn(
            'h-7 w-7',
            earned ? 'text-white drop-shadow' : 'text-neutral-400',
          )}
        />
      </div>
      <span
        className={cn(
          'text-[12px]',
          earned ? 'text-neutral-700 font-medium' : 'text-neutral-400',
        )}
      >
        {visual.chineseName}
      </span>
    </div>
  );
}

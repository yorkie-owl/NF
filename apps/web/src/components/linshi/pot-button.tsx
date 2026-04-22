import Link from 'next/link';
import { CookingPot } from 'lucide-react';

export interface PotButtonProps {
  href: string;
  label?: string;
  className?: string;
}

/**
 * NF `PotButton`：`from-brand-400 to-brand-500` + `shadow-glow-primary`（无 framer-motion）。
 */
export function PotButton({ href, label = '准备起锅', className }: PotButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`group flex flex-col items-center gap-1 text-[11px] font-medium text-brand-500 ${className ?? ''}`}
    >
      <span className="shadow-glow-primary -mt-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-500 text-white transition-transform active:scale-[0.94]">
        <CookingPot className="h-7 w-7" aria-hidden strokeWidth={2.2} />
      </span>
      <span className="text-brand-500">{label}</span>
    </Link>
  );
}

'use client';

import { Pencil } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ProfileSectionProps {
  title: string;
  icon?: ReactNode;
  editHref?: string;
  editLabel?: string;
  className?: string;
  children: ReactNode;
}

export function ProfileSection({
  title,
  icon,
  editHref,
  editLabel,
  className,
  children,
}: ProfileSectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl bg-white p-5 shadow-sm border border-neutral-100',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[16px] font-semibold text-neutral-900">
          {icon ? (
            <span className="text-brand-500" aria-hidden>
              {icon}
            </span>
          ) : null}
          {title}
        </h2>
        {editHref ? (
          <Link
            href={editHref}
            aria-label={editLabel ?? `编辑${title}`}
            className="text-neutral-400 hover:text-brand-500"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export interface ProfileRowProps {
  label: string;
  children: ReactNode;
}

export function ProfileRow({ label, children }: ProfileRowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[14px] text-neutral-500">{label}</span>
      <span className="flex-1 text-right text-[14px] text-neutral-900">
        {children}
      </span>
    </div>
  );
}

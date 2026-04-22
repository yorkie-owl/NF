'use client';

import type { ActivityJoinScope } from '@lin-shi/contracts';
import { cn } from '@/lib/cn';

export interface JoinScopeSelectorProps {
  value: ActivityJoinScope;
  onChange: (v: ActivityJoinScope) => void;
}

interface Option {
  id: ActivityJoinScope;
  label: string;
  sub?: string;
}

const OPTIONS: ReadonlyArray<Option> = [
  { id: 'ACQUAINTANCES_ONLY', label: '熟人扩展', sub: '好友的好友可加入' },
  { id: 'STRANGERS_OK', label: '接受陌生人', sub: '任何人都能加入' },
  { id: 'HIGH_TRUST_ONLY', label: '仅高信用', sub: '需要信用 ≥ 70' },
];

export function JoinScopeSelector({ value, onChange }: JoinScopeSelectorProps) {
  return (
    <div role="radiogroup" aria-label="加入范围" className="flex flex-col gap-2">
      {OPTIONS.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors',
              active
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50',
            )}
          >
            <span className="flex flex-col">
              <span className="text-[14px] font-semibold">{o.label}</span>
              {o.sub ? (
                <span
                  className={cn(
                    'text-[12px]',
                    active ? 'text-brand-700/80' : 'text-neutral-500',
                  )}
                >
                  {o.sub}
                </span>
              ) : null}
            </span>
            <span
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full border-2',
                active ? 'border-brand-500' : 'border-neutral-300',
              )}
              aria-hidden
            >
              {active ? (
                <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

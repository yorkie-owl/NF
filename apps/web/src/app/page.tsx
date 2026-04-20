'use client';

import { useHealth } from '@/hooks/use-health';
import { cn } from '@/lib/cn';

export default function HomePage() {
  const { data, isLoading, isError } = useHealth();

  const connected = Boolean(data?.ok);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-warm px-6">
      <section
        className={cn(
          'w-full max-w-sm rounded-3xl bg-white/90 backdrop-blur',
          'px-8 py-10 text-center shadow-glow-primary',
        )}
      >
        <h1 className="text-[28px] font-bold tracking-tight text-neutral-900">
          邻食
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          一起吃饭，从一锅好菜开始
        </p>

        <div className="mt-8">
          {isLoading ? (
            <StatusBadge tone="idle" label="正在连接 API…" />
          ) : isError || !connected ? (
            <StatusBadge tone="error" label="API 未连通 ❌" />
          ) : (
            <StatusBadge tone="success" label="API 已连通 ✅" />
          )}
        </div>

        {data?.ts ? (
          <p className="mt-3 text-xs tabular-nums text-neutral-400">
            {new Date(data.ts).toLocaleString('zh-CN')}
          </p>
        ) : null}
      </section>
    </main>
  );
}

type Tone = 'idle' | 'success' | 'error';

function StatusBadge({ tone, label }: { tone: Tone; label: string }) {
  const toneClass: Record<Tone, string> = {
    idle: 'bg-neutral-100 text-neutral-500',
    success: 'bg-success-100 text-neutral-900',
    error: 'bg-danger-100 text-neutral-900',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium',
        toneClass[tone],
      )}
    >
      {label}
    </span>
  );
}

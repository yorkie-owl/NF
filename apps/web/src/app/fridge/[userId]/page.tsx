import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { fetchIngredientById } from '@/lib/ingredients';
import { BottomNav } from '@/components/linshi/bottom-nav';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';

type Props = { params: Promise<{ userId: string }> };

const emojiByName: Record<string, string> = {
  番茄: '🍅',
  鸡蛋: '🥚',
  牛奶: '🥛',
};

export default async function FridgeInnerPage({ params }: Props) {
  const { userId } = await params;
  const ing = await fetchIngredientById(userId);
  if (!ing) {
    notFound();
  }

  const emoji = emojiByName[ing.name] ?? '🥗';

  return (
    <MobileShell variant="activity" className="flex flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-linshi-bottom-nav">
        <div className="min-h-full pb-8">
          <StatusBarDecor />

        <header className="flex items-center gap-3 px-5 pt-1">
          <Link
            href="/fridge"
            className="flex items-center gap-1 text-[14px] text-neutral-500"
          >
            <ArrowLeft className="h-5 w-5" />
            返回
          </Link>
        </header>

        <div className="px-5 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-rose-400/90">食材详情</p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">{ing.name}</h1>

          <div className="relative mt-6 aspect-square w-full max-w-[280px] overflow-hidden rounded-[28px] bg-gradient-to-br from-white to-rose-50 shadow-lg shadow-rose-200/40 ring-1 ring-rose-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,182,193,0.35),transparent_55%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[100px] leading-none drop-shadow-sm">{emoji}</span>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {ing.category ? (
              <div>
                <h2 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  <Tag className="h-3.5 w-3.5" />
                  分类
                </h2>
                <p className="mt-1.5 text-[16px] text-neutral-800">{ing.category}</p>
              </div>
            ) : null}

            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">风味标签</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {ing.tasteTags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-rose-200 bg-white px-3 py-1 text-[12px] text-rose-700 shadow-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
              <div>
                <p className="text-[10px] text-neutral-400">入库时间</p>
                <p className="mt-1 text-[12px] font-medium text-neutral-800">
                  {new Date(ing.addedAt).toLocaleString('zh-CN')}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Clock className="h-3 w-3" />
                  建议出走
                </p>
                <p className="mt-1 text-[12px] font-medium text-amber-700">
                  {new Date(ing.expiresAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <BottomNav active="activity" />
    </MobileShell>
  );
}

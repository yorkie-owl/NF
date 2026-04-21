import Link from 'next/link';
import { CalendarDays, Camera, MessageCircle, X } from 'lucide-react';
import type { Ingredient } from '@lin-shi/contracts';
import { BottomNav } from '@/components/linshi/bottom-nav';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';
import { fetchIngredients } from '@/lib/ingredients';

const emojiByName: Record<string, string> = {
  番茄: '🍅',
  鸡蛋: '🥚',
  牛奶: '🥛',
};

function IngredientCell({ ing }: { ing: Ingredient }) {
  const gone = new Date(ing.expiresAt) < new Date();
  const emoji = emojiByName[ing.name] ?? '🥬';
  return (
    <Link href={`/fridge/${ing.id}`} className="flex flex-col items-center gap-1">
      <div
        className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5 ${gone ? 'opacity-45' : ''}`}
      >
        <span className="text-2xl">{emoji}</span>
        {gone ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-pink-400 px-1.5 py-0.5 text-[9px] font-medium text-white">
            出走
          </span>
        ) : null}
      </div>
      <span className="max-w-[52px] truncate text-center text-[9px] leading-tight text-neutral-700">{ing.name}</span>
    </Link>
  );
}

/** Figma 画板「3」— 内页：上排 活动|食材，下排 最新消息通栏 */
export default async function FridgeInsidePage() {
  let items: Ingredient[] = [];
  let error: string | null = null;
  try {
    items = await fetchIngredients();
  } catch {
    error = '食材服务未连接';
  }

  const grid = items.length > 0 ? items : [];

  return (
    <MobileShell className="relative flex flex-col">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-linshi-bottom-nav">
        <div className="relative min-h-full pb-6">
          <StatusBarDecor />

          <div className="relative mx-3 mt-2 rounded-[28px] bg-white/96 p-4 pb-5 shadow-[0_12px_40px_rgba(255,140,120,0.12)] ring-1 ring-white/80">
            <div className="flex items-start justify-between">
              <h1 className="sr-only">冰箱内页</h1>
              <Link
                href="/"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100/95 text-neutral-500 shadow-inner"
                aria-label="关闭"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </Link>
            </div>

            {/* 上排：左 活动 · 右 食材（与 Figma 通栏分割一致） */}
            <div className="mt-2 grid grid-cols-2 gap-3 border-b border-neutral-100/90 pb-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
                  <CalendarDays className="h-4 w-4 shrink-0 text-rose-400" />
                  我的活动
                </div>
                <div className="rounded-2xl bg-amber-50/75 p-3 shadow-sm ring-1 ring-amber-100/60">
                  <div className="flex gap-2">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-100/90 text-2xl">
                      🍜
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium leading-snug text-neutral-800">今晚煮番茄鸡蛋面</p>
                      <p className="mt-1 text-[10px] text-neutral-400">今晚 7:00</p>
                      <span className="mt-1 inline-block rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        进行中
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l border-neutral-100 pl-3">
                <div className="mb-2 text-[13px] font-bold text-neutral-800">我的食材</div>
                {error ? (
                  <p className="text-[11px] font-medium text-orange-500">{error}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-x-1 gap-y-3">
                    {grid.slice(0, 9).map((ing) => (
                      <IngredientCell key={ing.id} ing={ing} />
                    ))}
                  </div>
                )}
                {!error && grid.length === 0 ? (
                  <p className="text-[11px] text-neutral-400">暂无食材</p>
                ) : null}

                <button
                  type="button"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200/80 bg-white py-2.5 text-[12px] font-medium text-neutral-600 shadow-sm"
                >
                  <Camera className="h-4 w-4" />
                  拍照识别食材
                </button>
              </div>
            </div>

            {/* 下排：最新消息通栏 */}
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
                <MessageCircle className="h-4 w-4 shrink-0 text-rose-400" />
                最新消息
              </div>
              <div className="rounded-2xl bg-neutral-50/90 p-3 ring-1 ring-neutral-100/80">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[12px] font-bold text-rose-700">
                    柴
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[12px] font-semibold text-neutral-800">柴桥子</span>
                      <span className="shrink-0 text-[10px] text-neutral-400">5分钟前</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-600">
                      我带面条，你带番茄鸡蛋吗～
                    </p>
                  </div>
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

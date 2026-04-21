import Link from 'next/link';
import { CalendarDays, Camera, MessageCircle, X } from 'lucide-react';
import type { Ingredient } from '@lin-shi/contracts';
import { BottomNav } from '@/components/linshi/bottom-nav';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';
import { fetchIngredients } from '@/lib/ingredients';

/** Figma 画板 2:8210 演示用 3×3 食材（API 无数据时） */
const FIGMA_DEMO_GRID: { name: string; emoji: string; gone: boolean }[] = [
  { name: '西兰花', emoji: '🥦', gone: true },
  { name: '胡萝卜', emoji: '🥕', gone: true },
  { name: '番茄', emoji: '🍅', gone: false },
  { name: '鸡蛋', emoji: '🥚', gone: false },
  { name: '柠檬', emoji: '🍋', gone: false },
  { name: '玉米', emoji: '🌽', gone: false },
  { name: '生菜', emoji: '🥬', gone: false },
  { name: '洋葱', emoji: '🧅', gone: false },
  { name: '葡萄', emoji: '🍇', gone: false },
];

const emojiByName: Record<string, string> = {
  西兰花: '🥦',
  胡萝卜: '🥕',
  番茄: '🍅',
  鸡蛋: '🥚',
  柠檬: '🍋',
  玉米: '🌽',
  生菜: '🥬',
  洋葱: '🧅',
  葡萄: '🍇',
  牛奶: '🥛',
};

type GridCell = { id?: string; name: string; emoji: string; gone: boolean };

function IngredientCell({ cell }: { cell: GridCell }) {
  const inner = (
    <>
      <div
        className={`relative flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/[0.06] ${cell.gone ? 'opacity-45 grayscale' : ''}`}
      >
        <span className="text-2xl">{cell.emoji}</span>
        {cell.gone ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-pink-400 px-1.5 py-0.5 text-[9px] font-medium text-white">
            出走
          </span>
        ) : null}
      </div>
      <span className="max-w-[52px] truncate text-center text-[9px] leading-tight text-neutral-700">{cell.name}</span>
    </>
  );

  if (cell.id) {
    return (
      <Link href={`/fridge/${cell.id}`} className="flex flex-col items-center gap-1">
        {inner}
      </Link>
    );
  }

  return <div className="flex flex-col items-center gap-1">{inner}</div>;
}

function buildGrid(items: Ingredient[], error: string | null): { cells: GridCell[]; showError: boolean } {
  if (error) {
    return { cells: FIGMA_DEMO_GRID, showError: true };
  }
  if (items.length === 0) {
    return { cells: FIGMA_DEMO_GRID, showError: false };
  }
  return {
    cells: items.slice(0, 9).map((ing) => ({
      id: ing.id,
      name: ing.name,
      emoji: emojiByName[ing.name] ?? '🥬',
      gone: new Date(ing.expiresAt) < new Date(),
    })),
    showError: false,
  };
}

/** Figma node 2:8210 — 打开冰箱后：渐变主卡、左栏活动+消息 / 右栏食材+拍照 */
export default async function FridgeInsidePage() {
  let items: Ingredient[] = [];
  let error: string | null = null;
  try {
    items = await fetchIngredients();
  } catch {
    error = '食材服务未连接';
  }

  const { cells, showError } = buildGrid(items, error);

  return (
    <MobileShell variant="activity" className="relative flex flex-col" data-node-id="2:8210">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-linshi-bottom-nav">
        <div className="relative min-h-full pb-6">
          <StatusBarDecor />

          {/* 主卡：粉→桃渐变、大圆角；约画板左右 5.13% 边距 */}
          <div className="relative mx-[5.13%] mt-3 overflow-hidden rounded-[40px] bg-gradient-to-br from-[#fff5f8] via-[#ffeef1] to-[#ffecd9] p-4 pb-5 shadow-[0_20px_50px_rgba(255,150,130,0.18)] ring-1 ring-white/50">
            <h1 className="sr-only">冰箱内页</h1>

            <Link
              href="/"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-md ring-1 ring-black/[0.04]"
              aria-label="关闭"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </Link>

            <div className="grid grid-cols-2 gap-0 pt-10">
              {/* 左栏：我的活动 + 最新消息 */}
              <div className="min-w-0 border-r border-white/70 pr-3">
                <div className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
                  <CalendarDays className="h-4 w-4 shrink-0 text-rose-400" />
                  我的活动
                </div>
                <div className="rounded-2xl bg-white/95 p-3 shadow-sm ring-1 ring-white/80">
                  <div className="flex gap-2">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-50 text-2xl">
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

                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
                    <MessageCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    最新消息
                  </div>
                  <div className="rounded-2xl bg-white/95 p-3 shadow-sm ring-1 ring-white/80">
                    <div className="flex items-start gap-2">
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

              {/* 右栏：我的食材 */}
              <div className="min-w-0 pl-3">
                <div className="mb-2 text-[13px] font-bold text-neutral-800">我的食材</div>
                {showError ? (
                  <p className="mb-2 text-[10px] font-medium text-orange-500/90">{error}</p>
                ) : null}
                <div className="grid grid-cols-3 gap-x-1 gap-y-3">
                  {cells.map((cell, i) => (
                    <IngredientCell key={cell.id ?? `${cell.name}-${i}`} cell={cell} />
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200/90 bg-white py-2.5 text-[12px] font-medium text-neutral-600 shadow-sm"
                >
                  <Camera className="h-4 w-4" />
                  拍照识别食材
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="activity" />
    </MobileShell>
  );
}

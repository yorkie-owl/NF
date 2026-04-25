import Link from 'next/link';
import { CalendarDays, Camera, MessageCircle, X } from 'lucide-react';
import type { Ingredient } from '@lin-shi/contracts';
import { BottomNav } from '@/components/linshi/bottom-nav';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';
import { getDemoIngredientPreviewHref } from '@/lib/demo-ingredients';
import { fetchIngredients } from '@/lib/ingredients';
import { RestlessnessRing } from '@/components/idea/RestlessnessRing';
import { restlessness } from '@/lib/restlessness';

/** Figma 画板 2:8210 演示用 3×3 OPC idea（API 无数据时） */
const FIGMA_DEMO_GRID: { name: string; emoji: string; gone: boolean }[] = [
  { name: '长期复利', emoji: '🌱', gone: true },
  { name: 'B2B 内核', emoji: '🛠️', gone: true },
  { name: '咖啡馆 MVP', emoji: '💡', gone: false },
  { name: 'React 全栈', emoji: '🧱', gone: false },
  { name: '锋利文案', emoji: '🔪', gone: false },
  { name: '社区运营', emoji: '🌾', gone: false },
  { name: '周更播客', emoji: '🎙️', gone: false },
  { name: '危机公关', emoji: '🛡️', gone: false },
  { name: '会员复利', emoji: '💎', gone: false },
];

const emojiByName: Record<string, string> = {
  长期复利: '🌱',
  'B2B 内核': '🛠️',
  '咖啡馆 MVP': '💡',
  'React 全栈': '🧱',
  锋利文案: '🔪',
  社区运营: '🌾',
  周更播客: '🎙️',
  危机公关: '🛡️',
  会员复利: '💎',
  '长期主义复利': '🌱',
  'B2B SaaS 内核': '🛠️',
  'React 全栈底子': '🧱',
  '社区运营手感': '🌾',
  '危机公关老手': '🛡️',
  '会员体系复利': '💎',
};

type GridCell = {
  id?: string;
  name: string;
  emoji: string;
  gone: boolean;
  href: string;
  restless: number;
};

function IngredientCell({ cell }: { cell: GridCell }) {
  return (
    <Link
      href={cell.href}
      className="group flex min-h-[48px] flex-col items-center gap-1 rounded-xl p-0.5 outline-none ring-rose-400/0 transition hover:opacity-95 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-rose-300/80"
    >
      <div
        className={`relative flex h-[40px] w-[40px] items-center justify-center rounded-[10px] bg-white shadow-md ring-1 ring-black/[0.06] transition group-hover:ring-rose-200/80 sm:h-[44px] sm:w-[44px] ${cell.gone ? 'opacity-45 grayscale' : ''}`}
      >
        <span className="text-lg sm:text-xl">{cell.emoji}</span>
        {cell.gone ? (
          <span className="absolute -right-1 -top-1 rounded-full bg-pink-400 px-1.5 py-0.5 text-[9px] font-medium text-white">
            出走
          </span>
        ) : (
          <span className="absolute -right-0.5 -top-0.5">
            <RestlessnessRing value={cell.restless} size={14} />
          </span>
        )}
      </div>
      <span className="max-w-[44px] truncate text-center text-[8px] leading-tight text-neutral-700 sm:max-w-[48px] sm:text-[9px]">
        {cell.name}
      </span>
    </Link>
  );
}

function buildGrid(items: Ingredient[], error: string | null): { cells: GridCell[]; showError: boolean } {
  const demoCells = (): GridCell[] =>
    FIGMA_DEMO_GRID.map((d, i) => ({
      name: d.name,
      emoji: d.emoji,
      gone: d.gone,
      href: getDemoIngredientPreviewHref(d.name),
      // demo 卡没有真 ingredient — 用位置生成一个有梯度的躁动指数，让进度环视觉有差异
      restless: d.gone ? 100 : 30 + ((i * 13) % 65),
    }));

  if (error) {
    return { cells: demoCells(), showError: true };
  }
  if (items.length === 0) {
    return { cells: demoCells(), showError: false };
  }
  return {
    cells: items.slice(0, 10).map((ing) => ({
      id: ing.id,
      name: ing.name,
      emoji: emojiByName[ing.name] ?? '🥬',
      gone: new Date(ing.expiresAt) < new Date(),
      href: `/fridge/${ing.id}`,
      restless: restlessness(ing),
    })),
    showError: false,
  };
}

/** Figma node 2:8210 — 打开冰箱后：渐变主卡、左栏活动+消息 / 右栏 idea+拍照 */
export default async function FridgeInsidePage() {
  let items: Ingredient[] = [];
  let error: string | null = null;
  try {
    items = await fetchIngredients();
  } catch {
    error = 'idea 服务未连接';
  }

  const { cells, showError } = buildGrid(items, error);

  return (
    <MobileShell variant="activity" className="relative flex flex-col" data-node-id="2:8210">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[175px]">
        <StatusBarDecor />

        {/* 主卡：粉→桃渐变、大圆角；约画板左右 5.13% 边距 */}
        <div className="relative mx-[5.13%] mt-3 flex-1 overflow-hidden rounded-[40px] bg-gradient-to-b from-[#ffb8c0] to-[#ffc8a9] p-4 pb-5 shadow-[0_20px_50px_rgba(255,150,130,0.18)] ring-1 ring-white/50">
          <h1 className="sr-only">冰箱内页</h1>

          <Link
            href="/fridge"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-md ring-1 ring-black/[0.04]"
            aria-label="关闭"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </Link>

          <div className="grid grid-cols-2 gap-0 pt-10">
            {/* 左栏：我的活动 + 最新消息 */}
            <div className="min-w-0 border-r border-white/70 pr-3">
              <Link href="/activities" className="mb-3 flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
                <CalendarDays className="h-4 w-4 shrink-0 text-rose-400" />
                我的活动
              </Link>
              <Link href="/activities" className="block rounded-2xl bg-white/95 p-3 text-left shadow-sm ring-1 ring-white/80">
                <div className="flex gap-2">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-50 text-2xl">
                    ☕
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium leading-snug text-neutral-800">周三晚 · 咖啡馆会员 MVP 拼桌</p>
                    <p className="mt-1 text-[10px] text-neutral-400">今晚 7:00</p>
                    <span className="mt-1 inline-block rounded-md bg-amber-200/90 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                      招募中
                    </span>
                  </div>
                </div>
              </Link>

              <div className="mt-4">
                <Link href="/chat/list" className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-neutral-800">
                  <MessageCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  最新消息
                </Link>
                <Link href="/chat/list" className="block rounded-2xl bg-white/95 p-3 text-left shadow-sm ring-1 ring-white/80">
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
                        我带 React 全栈，你带会员运营手感～
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 右栏：我的 idea */}
            <div className="min-w-0 pl-3">
              <div className="mb-0.5 text-[13px] font-bold text-neutral-800">我的 idea</div>
              <p className="mb-2 text-[10px] leading-snug text-neutral-500">
                点按 idea，给它打风格 + 场景标签
              </p>
              {showError ? (
                <p className="mb-2 text-[10px] font-medium text-orange-500/90">{error}</p>
              ) : null}
              <div className="grid grid-cols-5 gap-x-0.5 gap-y-2">
                {cells.map((cell, i) => (
                  <IngredientCell key={cell.id ?? `${cell.name}-${i}`} cell={cell} />
                ))}
              </div>

              <Link
                href="/fridge/recognize"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200/90 bg-white py-2.5 text-[12px] font-medium text-neutral-600 shadow-sm"
              >
                <Camera className="h-4 w-4" />
                从照片快速捕获 idea
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="activity" />
    </MobileShell>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { IngredientFridgeDetailClient } from '@/components/linshi/ingredient-fridge-detail-client';
import { BottomNav } from '@/components/linshi/bottom-nav';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';
import { getDemoIngredientByName } from '@/lib/demo-ingredients';

type Props = { params: Promise<{ name: string }> };

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
};

export default async function FridgePreviewDetailPage({ params }: Props) {
  const { name: raw } = await params;
  const name = decodeURIComponent(raw);
  const ing = getDemoIngredientByName(name);
  if (!ing) {
    notFound();
  }
  const emoji = emojiByName[ing.name] ?? '🥗';
  const isAway = new Date(ing.expiresAt) < new Date();

  return (
    <MobileShell variant="activity" className="flex flex-col">
      <div
        className={
          isAway
            ? 'flex min-h-0 flex-1 flex-col pb-[max(1.5rem,env(safe-area-inset-bottom))]'
            : 'flex min-h-0 flex-1 flex-col pb-[175px]'
        }
      >
        <div className="pb-8">
          <StatusBarDecor />

          <header className="flex items-center gap-3 px-5 pt-1">
            <Link
              href="/fridge/inside"
              className="flex items-center gap-1 text-[14px] text-neutral-500"
            >
              <ArrowLeft className="h-5 w-5" />
              返回
            </Link>
          </header>

          <div className="px-5 pt-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-rose-400/90">idea 详情（本地预览）</p>
            <h1 className="mt-1 text-2xl font-bold text-neutral-900">{ing.name}</h1>
            <p className="mt-1 text-[11px] text-neutral-500">给 TA 打风格 + 场景标签，让 TA 自己出门找拼桌</p>

            <IngredientFridgeDetailClient ingredient={ing} logoEmoji={emoji} demoMode />

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

      {isAway ? null : <BottomNav active="activity" />}
    </MobileShell>
  );
}

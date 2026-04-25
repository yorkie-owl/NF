'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import type { Ingredient } from '@lin-shi/contracts';
import {
  CONTEXT_PRESETS,
  TASTE_PRESETS,
  tagToEmoji,
} from '@/lib/explore-tag-presets';
import { updateIngredientTags } from '@/lib/ingredients';

type Props = {
  ingredient: Ingredient;
  logoEmoji: string;
  /** 无后端时仅本地改标签，不写 API */
  demoMode?: boolean;
};

function normalizeTag(s: string): string {
  return s.trim();
}

export function IngredientFridgeDetailClient({ ingredient, logoEmoji, demoMode = false }: Props) {
  const router = useRouter();
  const [tasteTags, setTasteTags] = useState(ingredient.tasteTags);
  const [contextTags, setContextTags] = useState(ingredient.contextTags);
  const [tasteDraft, setTasteDraft] = useState('');
  const [contextDraft, setContextDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);
  const [floatEmoji, setFloatEmoji] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTasteTags(ingredient.tasteTags);
    setContextTags(ingredient.contextTags);
  }, [ingredient.tasteTags, ingredient.contextTags]);

  const runPulse = (emoji: string) => {
    setPulse((n) => n + 1);
    setFloatEmoji(emoji);
    window.setTimeout(() => setFloatEmoji(null), 700);
  };

  const save = useCallback(
    (nextT: string[], nextC: string[]) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      saveTimer.current = setTimeout(async () => {
        setErr(null);
        if (demoMode) {
          return;
        }
        setSaving(true);
        try {
          await updateIngredientTags(ingredient.id, {
            tasteTags: nextT,
            contextTags: nextC,
          });
          router.refresh();
        } catch (e) {
          setErr(e instanceof Error ? e.message : '保存失败');
        } finally {
          setSaving(false);
        }
      }, 420);
    },
    [demoMode, ingredient.id, router],
  );

  const addTaste = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t || tasteTags.includes(t)) return;
    const next = [...tasteTags, t];
    setTasteTags(next);
    runPulse(tagToEmoji(t));
    save(next, contextTags);
  };

  const addContext = (raw: string) => {
    const t = normalizeTag(raw);
    if (!t || contextTags.includes(t)) return;
    const next = [...contextTags, t];
    setContextTags(next);
    runPulse(tagToEmoji(t));
    save(tasteTags, next);
  };

  const removeTaste = (t: string) => {
    const next = tasteTags.filter((x) => x !== t);
    setTasteTags(next);
    save(next, contextTags);
  };

  const removeContext = (t: string) => {
    const next = contextTags.filter((x) => x !== t);
    setContextTags(next);
    save(tasteTags, next);
  };

  const hasHeroTaste = tasteTags.length > 0;
  const hasHeroContext = contextTags.length > 0;
  const emojiTextClass =
    hasHeroTaste && hasHeroContext
      ? 'text-[min(5.5rem,18vw)] sm:text-[72px]'
      : hasHeroTaste || hasHeroContext
        ? 'text-[min(5.8rem,20vw)] sm:text-[88px]'
        : 'text-[100px]';

  return (
    <div>
      <div
        className="relative mt-6 aspect-square w-full max-w-[280px] overflow-hidden rounded-[28px] bg-gradient-to-br from-white to-rose-50 shadow-lg shadow-rose-200/40 ring-1 ring-rose-100"
        aria-label="已选探索标签与 idea 主视觉"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,182,193,0.35),transparent_55%)]" />
        <div className="absolute inset-0 flex flex-col p-2.5 sm:p-3">
          {hasHeroTaste ? (
            <div className="flex max-h-[32%] min-h-0 w-full flex-wrap content-center justify-center gap-1.5 overflow-y-auto [scrollbar-width:thin]">
              {tasteTags.map((t) => (
                <span
                  key={`hero-taste-${t}`}
                  className="inline-flex max-w-full shrink-0 items-center rounded-full border border-rose-200/90 bg-rose-50/95 px-2 py-0.5 text-[10px] font-medium leading-tight text-rose-800 shadow-sm"
                >
                  <span className="mr-0.5" aria-hidden>
                    {tagToEmoji(t)}
                  </span>
                  {t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <motion.div
              key={pulse}
              initial={{ scale: 1, rotate: 0 }}
              animate={{ scale: [1, 1.12, 1], rotate: [0, -4, 3, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              <span
                className={`${emojiTextClass} leading-none drop-shadow-sm transition-all duration-300 ease-out`}
              >
                {logoEmoji}
              </span>
              <AnimatePresence>
                {floatEmoji ? (
                  <motion.span
                    key={floatEmoji + pulse}
                    className="pointer-events-none absolute -right-1 -top-2 text-3xl"
                    initial={{ y: 8, opacity: 0, scale: 0.6 }}
                    animate={{ y: -32, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                  >
                    {floatEmoji}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.div>
          </div>

          {hasHeroContext ? (
            <div className="flex max-h-[32%] min-h-0 w-full flex-wrap content-center justify-center gap-1.5 overflow-y-auto [scrollbar-width:thin]">
              {contextTags.map((t) => (
                <span
                  key={`hero-ctx-${t}`}
                  className="inline-flex max-w-full shrink-0 items-center rounded-full border border-amber-200/80 bg-amber-50/95 px-2 py-0.5 text-[10px] font-medium leading-tight text-amber-900 shadow-sm"
                >
                  <span className="mr-0.5" aria-hidden>
                    {tagToEmoji(t)}
                  </span>
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-7 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-rose-400/90">
          <Sparkles className="h-3.5 w-3.5" />
          为 TA 的探索加点设定
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
          选风格与场景，像旅行青蛙一样让 idea 带着偏好出门找拼桌。
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">风格</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {TASTE_PRESETS.map((p) => {
                const on = tasteTags.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => (on ? removeTaste(p) : addTaste(p))}
                    className={
                      on
                        ? 'rounded-full border border-rose-300 bg-rose-50/80 px-2.5 py-1 text-[12px] font-medium text-rose-800 shadow-sm'
                        : 'rounded-full border border-neutral-200/90 bg-white px-2.5 py-1 text-[12px] text-neutral-600 ring-0 transition hover:border-rose-200'
                    }
                  >
                    {tagToEmoji(p)} {p}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                value={tasteDraft}
                onChange={(e) => setTasteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTaste(tasteDraft);
                    setTasteDraft('');
                  }
                }}
                placeholder="自定义风格，回车添加"
                className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-800 outline-none focus:border-rose-300"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tasteTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white pl-2.5 pr-1 py-1 text-[12px] text-rose-700 shadow-sm"
                >
                  {t}
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-rose-500 hover:bg-rose-100"
                    aria-label={`移除 ${t}`}
                    onClick={() => removeTaste(t)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">场景 / 对方</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CONTEXT_PRESETS.map((p) => {
                const on = contextTags.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => (on ? removeContext(p) : addContext(p))}
                    className={
                      on
                        ? 'rounded-full border border-amber-300/80 bg-amber-50/90 px-2.5 py-1 text-[12px] font-medium text-amber-900 shadow-sm'
                        : 'rounded-full border border-neutral-200/90 bg-white px-2.5 py-1 text-[12px] text-neutral-600 transition hover:border-amber-200'
                    }
                  >
                    {tagToEmoji(p)} {p}
                  </button>
                );
              })}
            </div>
            <div className="mt-2">
              <input
                value={contextDraft}
                onChange={(e) => setContextDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addContext(contextDraft);
                    setContextDraft('');
                  }
                }}
                placeholder="自定义标签，回车添加"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-800 outline-none focus:border-amber-300/80"
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {contextTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/30 pl-2.5 pr-1 py-1 text-[12px] text-amber-900 ring-1 ring-amber-100/80"
                >
                  {t}
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-amber-600 hover:bg-amber-100"
                    aria-label={`移除 ${t}`}
                    onClick={() => removeContext(t)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {saving ? (
          <p className="mt-3 text-[11px] text-neutral-400">保存中…</p>
        ) : null}
        {err ? <p className="mt-2 text-[11px] text-red-600">{err}</p> : null}

        <div className="mt-8 border-t border-neutral-100 pt-5">
          <Link
            href="/activities"
            className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-rose-400 to-amber-400 px-4 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-rose-200/50 ring-1 ring-white/30 transition active:scale-[0.99] focus-visible:outline focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            出门找拼桌
          </Link>
          <p className="mt-2.5 text-center text-[10px] leading-relaxed text-neutral-400">
            用当前风格与场景偏好，去活动里找合拍的协作伙伴
          </p>
        </div>
      </div>
    </div>
  );
}

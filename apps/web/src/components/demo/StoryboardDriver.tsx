'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { OpcIdeaCard } from '@lin-shi/culina-agent';
import { STORYBOARD_FRAMES } from '@/lib/storyboard-frames';
import { matchIdeas } from '@/lib/opc-agent';
import { IdeaWalkOut } from '@/components/idea/IdeaWalkOut';
import { getDemoIngredientByName } from '@/lib/demo-ingredients';

const DEMO_IDEAS: ReadonlyArray<OpcIdeaCard> = (['番茄', '鸡蛋'] as const).flatMap((name) => {
  const ing = getDemoIngredientByName(name);
  if (!ing) return [];
  return [
    {
      name: ing.name,
      styleTags: ing.tasteTags,
      sceneTags: ing.contextTags,
      description: '',
    } satisfies OpcIdeaCard,
  ];
});

export function StoryboardDriver() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [walkOut, setWalkOut] = useState(false);
  const [agentLine, setAgentLine] = useState<string | null>(null);

  const walkOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameTokenRef = useRef(0);

  const frame = STORYBOARD_FRAMES[idx]!;

  const goTo = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(STORYBOARD_FRAMES.length - 1, n));
      const myToken = ++frameTokenRef.current;

      if (walkOutTimerRef.current) {
        clearTimeout(walkOutTimerRef.current);
        walkOutTimerRef.current = null;
      }

      setIdx(next);
      const f = STORYBOARD_FRAMES[next]!;
      router.push(`${f.route}?demo=1`);
      setWalkOut(false);
      setAgentLine(null);

      if (f.triggerWalkOut) {
        walkOutTimerRef.current = setTimeout(() => {
          if (myToken !== frameTokenRef.current) return;
          setWalkOut(true);
        }, 400);
      }

      if (f.triggerAgentMatch) {
        setAgentLine('agent thinking…');
        matchIdeas([...DEMO_IDEAS])
          .then(({ result, source }) => {
            if (myToken !== frameTokenRef.current) return;
            setAgentLine(`${result.reason}（${source === 'live' ? '实时' : '缓存'}）`);
          })
          .catch(() => {
            if (myToken !== frameTokenRef.current) return;
            setAgentLine('（agent 暂时不在线，使用预录方案）');
          });
      }
    },
    [router],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goTo(idx + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(idx - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, goTo]);

  useEffect(() => {
    return () => {
      if (walkOutTimerRef.current) clearTimeout(walkOutTimerRef.current);
    };
  }, []);

  return (
    <>
      <IdeaWalkOut
        visible={walkOut}
        emoji="💡"
        name="咖啡馆 MVP"
        startX={window.innerWidth / 2 - 24}
        startY={window.innerHeight / 2 - 24}
        onDone={() => setWalkOut(false)}
      />

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3">
        <div className="pointer-events-auto mx-3 max-w-[760px] rounded-2xl bg-black/85 px-4 py-3 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => goTo(idx - 1)}
              aria-label="上一帧"
              disabled={idx === 0}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wider text-white/50">
                Frame {frame.id} / {STORYBOARD_FRAMES.length}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed">{frame.narration}</p>
              {agentLine ? (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-rose-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  {agentLine}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => goTo(idx + 1)}
              aria-label="下一帧"
              disabled={idx === STORYBOARD_FRAMES.length - 1}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 hover:bg-rose-400 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

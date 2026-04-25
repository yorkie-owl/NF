'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { STORYBOARD_FRAMES } from '@/lib/storyboard-frames';
import { matchIdeas } from '@/lib/opc-agent';
import { IdeaWalkOut } from '@/components/idea/IdeaWalkOut';

export function StoryboardDriver() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [walkOut, setWalkOut] = useState(false);
  const [agentLine, setAgentLine] = useState<string | null>(null);

  const frame = STORYBOARD_FRAMES[idx]!;

  const goTo = useCallback(
    (n: number) => {
      const next = Math.max(0, Math.min(STORYBOARD_FRAMES.length - 1, n));
      setIdx(next);
      const f = STORYBOARD_FRAMES[next]!;
      router.push(`${f.route}?demo=1`);
      setWalkOut(false);
      setAgentLine(null);
      if (f.triggerWalkOut) {
        setTimeout(() => setWalkOut(true), 400);
      }
      if (f.triggerAgentMatch) {
        setAgentLine('agent thinking…');
        matchIdeas([
          { name: '番茄', styleTags: ['快速原型', '极简'], sceneTags: ['独立咖啡馆'], description: '想做独立咖啡馆 MVP' },
          { name: '鸡蛋', styleTags: ['React 全栈'], sceneTags: ['MVP 速搭'], description: '能给 React 全栈支持' },
        ])
          .then(({ result, source }) => {
            setAgentLine(`${result.reason}（${source === 'live' ? '实时' : '缓存'}）`);
          })
          .catch(() => setAgentLine('（agent 暂时不在线，使用预录方案）'));
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

  return (
    <>
      <IdeaWalkOut
        visible={walkOut}
        emoji="🍅"
        name="番茄"
        startX={typeof window !== 'undefined' ? window.innerWidth / 2 - 24 : 200}
        startY={typeof window !== 'undefined' ? window.innerHeight / 2 - 24 : 300}
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

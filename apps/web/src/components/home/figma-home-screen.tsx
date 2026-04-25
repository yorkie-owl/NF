'use client';

import Link from 'next/link';
import { Bell, Cake, ChefHat, Clock, Home, Leaf } from 'lucide-react';
import { useCallback, useRef, useState, type RefObject } from 'react';
import { StatusBarDecor } from '@/components/linshi/status-bar';

type MagnetDef = {
  id: string;
  title: string;
  sub?: string;
  initialPct: { left: number; top: number };
  widthPct: number;
  rotateDeg: number;
  variant: 'pink' | 'cyan' | 'blue' | 'white';
  Icon: typeof Cake;
};

const MAGNETS: MagnetDef[] = [
  {
    id: 'taste',
    title: '口味达人',
    initialPct: { left: 5, top: 7 },
    widthPct: 22,
    rotateDeg: -6,
    variant: 'pink',
    Icon: Cake,
  },
  {
    id: 'health',
    title: '健康生活',
    initialPct: { left: 54, top: 6 },
    widthPct: 34,
    rotateDeg: 0,
    variant: 'cyan',
    Icon: Leaf,
  },
  {
    id: 'host',
    title: '热情房主',
    initialPct: { left: 56, top: 34 },
    widthPct: 24,
    rotateDeg: -8,
    variant: 'blue',
    Icon: Home,
  },
  {
    id: 'time',
    title: '准时达人',
    sub: '100%履约',
    initialPct: { left: 7, top: 54 },
    widthPct: 26,
    rotateDeg: 3,
    variant: 'white',
    Icon: Clock,
  },
];

function magnetClass(v: MagnetDef['variant']) {
  switch (v) {
    case 'pink':
      return 'bg-gradient-to-br from-[#ffd6e8] via-[#fff5f9] to-white shadow-md ring-1 ring-pink-100/80';
    case 'cyan':
      return 'bg-gradient-to-r from-[#b8f0f0] via-[#e0fbff] to-[#f0fdff] shadow-md ring-1 ring-cyan-100/80';
    case 'blue':
      return 'bg-gradient-to-br from-[#cfe4ff] via-[#f0f7ff] to-white shadow-md ring-1 ring-blue-100/80';
    case 'white':
      return 'bg-white shadow-[0_10px_28px_rgba(255,120,150,0.28)] ring-1 ring-pink-100/60';
    default:
      return '';
  }
}

function DraggableMagnet({
  def,
  boundsRef,
}: {
  def: MagnetDef;
  boundsRef: RefObject<HTMLDivElement | null>;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      elRef.current?.setPointerCapture(e.pointerId);
      drag.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: offset.x,
        origY: offset.y,
      };
    },
    [offset.x, offset.y],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      const bounds = boundsRef.current;
      const el = elRef.current;
      if (!d || !bounds || !el) return;
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const rect = bounds.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      const nx = d.origX + dx;
      const ny = d.origY + dy;
      const pad = 4;
      const left0 = (def.initialPct.left / 100) * rect.width;
      const top0 = (def.initialPct.top / 100) * rect.height;
      const maxX = rect.width - left0 - er.width - pad;
      const minX = -left0 + pad;
      const maxY = rect.height - top0 - er.height - pad;
      const minY = -top0 + pad;
      setOffset({
        x: Math.max(minX, Math.min(maxX, nx)),
        y: Math.max(minY, Math.min(maxY, ny)),
      });
    },
    [boundsRef, def.initialPct.left, def.initialPct.top],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    try {
      elRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  const { Icon } = def;
  const w = `${def.widthPct}%`;

  return (
    <div
      ref={elRef}
      role="button"
      tabIndex={0}
      className={`absolute z-20 touch-none select-none rounded-2xl p-2 ${magnetClass(def.variant)}`}
      style={{
        left: `${def.initialPct.left}%`,
        top: `${def.initialPct.top}%`,
        width: w,
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${def.rotateDeg}deg)`,
        cursor: 'grab',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      data-node-id={`magnet-${def.id}`}
    >
      <div className="flex flex-col items-center gap-0.5 text-center">
        <Icon
          className={`h-6 w-6 shrink-0 ${
            def.variant === 'cyan'
              ? 'text-emerald-700'
              : def.variant === 'blue'
                ? 'text-blue-600'
                : def.variant === 'white'
                  ? 'text-neutral-800'
                  : 'text-rose-600'
          }`}
          strokeWidth={1.75}
        />
        <span
          className={`text-[11px] font-bold leading-tight ${
            def.variant === 'cyan' ? 'text-emerald-900' : def.variant === 'blue' ? 'text-blue-800' : 'text-neutral-900'
          }`}
        >
          {def.title}
        </span>
        {def.sub ? <span className="text-[9px] font-medium text-neutral-500">{def.sub}</span> : null}
      </div>
    </div>
  );
}

/**
 * Figma node 2:8906 — 390×844 画板首页：顶区光晕 + 头栏 + 提示 + 冰箱门 + 可拖拽冰箱贴。
 */
export function FigmaHomeScreen() {
  const fridgeBoundsRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative min-h-full" data-node-id="2:8906">
      {/* 稿：右上角极淡粉光（仅顶区氛围，非整屏铺色） */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(280px,32%)] overflow-hidden rounded-t-[2.5rem]"
        aria-hidden
      >
        <div className="absolute -right-8 -top-12 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,210,220,0.65),transparent_68%)]" />
      </div>

      <div className="relative z-10 flex flex-col">
        <StatusBarDecor />

        <header className="relative z-20 flex shrink-0 items-center justify-between px-5 pt-1">
          <span className="text-xl font-bold tracking-tight text-neutral-900">邻食</span>
          <div className="flex items-center gap-2">
            <Link
              href="/activities"
              className="flex items-center gap-1.5 rounded-full border border-[#ff4d4f] bg-white px-2.5 py-1.5 text-[11px] font-medium text-[#ff4d4f] shadow-sm"
            >
              <ChefHat className="h-3.5 w-3.5" />
              我的局
              <span className="rounded-full bg-[#ff4d4f] px-1.5 text-[9px] leading-none text-white">2</span>
            </Link>
            <Link
              href="/chat/list?tab=unread"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md"
              aria-label="通知"
            >
              <Bell className="h-4 w-4 text-neutral-600" />
            </Link>
          </div>
        </header>

        <p className="relative z-20 mx-auto mt-3 max-w-[82%] rounded-full bg-white px-4 py-2 text-center text-[12px] text-neutral-400 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          点击冰箱门查看 idea 和局 ↓
        </p>

        {/* 画板：门区约 inset 8.97% 横、上 19.19% 起、下留白给底栏 — 用 flex-1 承接 */}
        <div className="relative z-20 mx-[8.97%] mt-4 min-h-[min(480px,56.9vh)] flex-1 pb-[10px]">
          <div
            ref={fridgeBoundsRef}
            className="relative h-full min-h-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]"
            data-name="fridge-door"
          >
            <Link
              href="/fridge/inside"
              className="absolute inset-0 z-0 rounded-[28px]"
              aria-label="打开冰箱门，查看 idea 和局"
            />

            {/* 门缝中线 */}
            <div className="pointer-events-none absolute left-[10%] right-[10%] top-1/2 z-[1] h-px -translate-y-1/2 bg-neutral-200/90" />

            {/* 右侧把手条 */}
            <div className="pointer-events-none absolute bottom-[22%] right-[3%] top-[22%] z-[1] w-[5px] rounded-full bg-neutral-200/95" />

            {MAGNETS.map((m) => (
              <DraggableMagnet key={m.id} def={m} boundsRef={fridgeBoundsRef} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

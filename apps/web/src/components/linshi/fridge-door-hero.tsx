'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Cake, Clock, Home, Leaf } from 'lucide-react';

const STORAGE_KEY = 'linshi-fridge-magnet-pos';

type Pos = { cx: number; cy: number };
type MagnetId = 'taste' | 'health' | 'host' | 'punctual';

/** 中心点坐标（相对门板的百分比），避免四枚磁贴在默认布局下互相遮挡 */
const DEFAULTS: Record<MagnetId, Pos> = {
  taste: { cx: 18, cy: 24 },
  health: { cx: 78, cy: 22 },
  host: { cx: 72, cy: 46 },
  punctual: { cx: 22, cy: 70 },
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

const MAGNET_IDS: MagnetId[] = ['taste', 'health', 'host', 'punctual'];

function loadSaved(): Partial<Record<MagnetId, Pos>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return {};
    const out: Partial<Record<MagnetId, Pos>> = {};
    for (const id of MAGNET_IDS) {
      const v = parsed[id];
      if (v && typeof v === 'object' && 'cx' in v && 'cy' in v) {
        const cx = (v as { cx: unknown }).cx;
        const cy = (v as { cy: unknown }).cy;
        if (typeof cx === 'number' && typeof cy === 'number') {
          out[id] = { cx, cy };
        }
      }
    }
    return out;
  } catch {
    return {};
  }
}

function savePositions(pos: Record<MagnetId, Pos>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    /* ignore quota */
  }
}

type MagnetProps = {
  boundsRef: React.RefObject<HTMLElement | null>;
  magnetId: MagnetId;
  position: Pos;
  onPositionChange: (id: MagnetId, pos: Pos) => void;
  onDragEnd: () => void;
  className?: string;
  /** 视觉倾斜（度），与 translate 一起合成 */
  rotateDeg?: number;
  children: React.ReactNode;
};

function FridgeMagnet({
  boundsRef,
  magnetId,
  position,
  onPositionChange,
  onDragEnd,
  className = '',
  rotateDeg = 0,
  children,
}: MagnetProps) {
  const [dragging, setDragging] = useState(false);
  const [z, setZ] = useState(20);
  const startRef = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startRef.current = {
      px: e.clientX,
      py: e.clientY,
      cx: position.cx,
      cy: position.cy,
    };
    setDragging(true);
    setZ(50);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current || !boundsRef.current) return;
    const rect = boundsRef.current.getBoundingClientRect();
    const { px, py, cx: scx, cy: scy } = startRef.current;
    const dcx = ((e.clientX - px) / rect.width) * 100;
    const dcy = ((e.clientY - py) / rect.height) * 100;
    const next = {
      cx: clamp(scx + dcx, 10, 90),
      cy: clamp(scy + dcy, 12, 88),
    };
    onPositionChange(magnetId, next);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (startRef.current) {
      startRef.current = null;
      setDragging(false);
      setZ(20);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      onDragEnd();
    }
  };

  return (
    <div
      className={`absolute select-none ${dragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={{
        left: `${position.cx}%`,
        top: `${position.cy}%`,
        transform: `translate(-50%, -50%)${rotateDeg ? ` rotate(${rotateDeg}deg)` : ''}`,
        zIndex: z,
        touchAction: dragging ? 'none' : 'manipulation',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="button"
      tabIndex={0}
      aria-grabbed={dragging}
      aria-label="冰箱贴，可拖动"
    >
      {children}
    </div>
  );
}

type FridgeDoorHeroProps = {
  /** 点击右侧把手区域：打开「我的冰箱」弹层（Figma 画板2），不再跳转独立全屏路由 */
  onOpenFridge?: () => void;
};

/**
 * 首页核心：双开门冰箱主视觉。磁贴可在门板内拖拽；默认位置已错开避免「热情房主」与「准时达人」叠字。
 */
export function FridgeDoorHero({ onOpenFridge }: FridgeDoorHeroProps) {
  const doorRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<MagnetId, Pos>>(DEFAULTS);

  useEffect(() => {
    const saved = loadSaved();
    setPositions((prev) => {
      const next = { ...prev };
      (Object.keys(next) as MagnetId[]).forEach((k) => {
        const v = saved[k];
        if (v && typeof v.cx === 'number' && typeof v.cy === 'number') {
          next[k] = v;
        }
      });
      return next;
    });
  }, []);

  const onPositionChange = useCallback((id: MagnetId, pos: Pos) => {
    setPositions((p) => ({ ...p, [id]: pos }));
  }, []);

  const onDragEnd = useCallback(() => {
    setPositions((p) => {
      savePositions(p);
      return p;
    });
  }, []);

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-[360px] flex-1 flex-col px-1">
      <div className="pointer-events-none absolute -bottom-1 left-1/2 z-0 h-5 w-[88%] -translate-x-1/2 rounded-[50%] bg-black/10 blur-lg" />

      {/* flex-1：在顶栏与底栏之间占满剩余高度，不再用 min-h-[85vh] 撑出滚动条 */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col rounded-[44px] bg-gradient-to-br from-slate-300 via-slate-200 to-slate-400 p-[11px] shadow-[0_20px_50px_rgba(15,23,42,0.14),0_4px_12px_rgba(15,23,42,0.08)]">
          <div
            ref={doorRef}
            className="relative min-h-0 flex-1 overflow-hidden rounded-[36px] ring-1 ring-white/40"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200/95"
              aria-hidden
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/90 via-white/20 to-transparent" />
            <div className="pointer-events-none absolute -left-[20%] top-0 h-full w-[55%] rotate-[12deg] bg-gradient-to-r from-white/55 via-white/15 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-3/5 w-1/3 bg-gradient-to-tl from-sky-100/30 to-transparent" />

            <div className="pointer-events-none absolute right-5 top-1/2 z-[2] flex h-[36%] -translate-y-1/2 flex-col items-center justify-center">
              <div className="h-full w-[14px] rounded-full bg-gradient-to-r from-slate-400/90 via-slate-200 to-slate-100 shadow-[inset_2px_0_4px_rgba(255,255,255,0.85),-2px_0_6px_rgba(0,0,0,0.08)]" />
              <span className="mt-2 text-[9px] font-medium tracking-widest text-slate-500/80">开门</span>
            </div>

            {/* 画板1：仅右侧把手一带打开弹层（画板2）；磁贴 z 更高可拖 */}
            {onOpenFridge ? (
              <button
                type="button"
                onClick={onOpenFridge}
                className="absolute inset-y-[6%] right-0 z-10 w-[42%] rounded-r-[36px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d4f]/50 focus-visible:ring-inset"
                aria-label="从把手侧打开冰箱，进入我的冰箱"
              />
            ) : null}

            <FridgeMagnet
              boundsRef={doorRef}
              magnetId="taste"
              position={positions.taste}
              onPositionChange={onPositionChange}
              onDragEnd={onDragEnd}
              className="w-[76px] rounded-xl bg-gradient-to-b from-pink-100/95 to-white/90 p-1.5 shadow-md shadow-pink-200/40 ring-1 ring-white/60 backdrop-blur-[2px]"
            >
              <Cake className="mx-auto h-6 w-6 text-pink-400" />
              <p className="mt-0.5 text-center text-[9px] font-bold text-rose-500">口味达人</p>
            </FridgeMagnet>

            <FridgeMagnet
              boundsRef={doorRef}
              magnetId="health"
              position={positions.health}
              onPositionChange={onPositionChange}
              onDragEnd={onDragEnd}
              className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-emerald-100/95 to-sky-100/95 px-2 py-1 shadow-md ring-1 ring-white/50"
            >
              <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="whitespace-nowrap text-[8px] font-semibold text-neutral-700">健康生活</span>
            </FridgeMagnet>

            <FridgeMagnet
              boundsRef={doorRef}
              magnetId="host"
              position={positions.host}
              onPositionChange={onPositionChange}
              onDragEnd={onDragEnd}
              rotateDeg={-4}
              className="w-[80px] rounded-xl border border-white/70 bg-gradient-to-br from-sky-50 to-white/90 p-1.5 shadow-lg backdrop-blur-sm"
            >
              <Home className="mx-auto h-6 w-6 text-sky-500" />
              <p className="mt-0.5 text-center text-[9px] font-bold text-sky-800">热情房主</p>
            </FridgeMagnet>

            <FridgeMagnet
              boundsRef={doorRef}
              magnetId="punctual"
              position={positions.punctual}
              onPositionChange={onPositionChange}
              onDragEnd={onDragEnd}
              className="w-[78px] rounded-xl bg-white/95 p-1.5 shadow-md ring-1 ring-neutral-100"
            >
              <Clock className="mx-auto h-6 w-6 text-amber-400" />
              <p className="mt-0.5 text-center text-[10px] font-bold text-neutral-800">准时达人</p>
              <p className="text-center text-[8px] text-neutral-400">100%履约</p>
            </FridgeMagnet>

            <div className="pointer-events-none absolute inset-y-8 left-2 w-px bg-gradient-to-b from-transparent via-white/80 to-transparent opacity-60" />
          </div>
        </div>
      </div>

      <p className="shrink-0 pt-1 text-center text-[10px] leading-snug text-neutral-400">
        点击右侧把手区域进入我的冰箱
      </p>
    </div>
  );
}

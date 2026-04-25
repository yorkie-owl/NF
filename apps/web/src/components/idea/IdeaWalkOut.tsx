'use client';

import { AnimatePresence, motion } from 'framer-motion';

type Props = {
  visible: boolean;
  emoji: string;
  name: string;
  /** 屏幕坐标（px），决定起飞起点；默认从中间 */
  startX?: number;
  startY?: number;
  /** 飞行结束回调 */
  onDone?: () => void;
};

export function IdeaWalkOut({ visible, emoji, name, startX = 0, startY = 0, onDone }: Props) {
  return (
    <AnimatePresence {...(onDone ? { onExitComplete: onDone } : {})}>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-50 flex flex-col items-center"
          initial={{ x: startX, y: startY, scale: 1, opacity: 1, rotate: 0 }}
          animate={{
            x: window.innerWidth + 80,
            y: startY - 200,
            scale: 0.6,
            opacity: 0.85,
            rotate: 25,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-xl ring-2 ring-rose-200">
            {emoji}
          </div>
          <span className="mt-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-rose-500 shadow">
            {name} 出走中…
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

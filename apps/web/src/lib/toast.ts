/**
 * Minimal pub-sub toast system. No dependencies.
 * UI renderer lives in `components/common/ToastHost.tsx` mounted at app root.
 */

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
  ttlMs: number;
}

type Listener = (msg: ToastMessage) => void;

let seq = 0;
const listeners = new Set<Listener>();

export function subscribeToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function push(tone: ToastTone, text: string, ttlMs = 2500): void {
  const msg: ToastMessage = { id: ++seq, tone, text, ttlMs };
  for (const l of listeners) l(msg);
}

export const toast = {
  success: (text: string, ttlMs?: number) => push('success', text, ttlMs),
  error: (text: string, ttlMs?: number) => push('error', text, ttlMs),
  info: (text: string, ttlMs?: number) => push('info', text, ttlMs),
};

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Camera, ChevronLeft, ImageIcon } from 'lucide-react';
import { MobileShell } from '@/components/linshi/mobile-shell';
import { StatusBarDecor } from '@/components/linshi/status-bar';
import {
  type RecognizedPreview,
  createIngredientOnServer,
  recognizeIngredientsFromImage,
} from '@/lib/ingredients';
import { extractApiError } from '@/lib/api';

type Phase = 'idle' | 'recognizing' | 'results' | 'saving';

function showResultPanel(phase: Phase) {
  return phase === 'results' || phase === 'saving';
}

function stopMediaStream(s: MediaStream | null) {
  if (!s) return;
  s.getTracks().forEach((t) => t.stop());
}

function captureVideoFrameToJpegFile(video: HTMLVideoElement): File | null {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (w < 2 || h < 2) return null;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(video, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const parts = dataUrl.split(',');
  const bin = atob(parts[1] ?? '');
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], 'camera-capture.jpg', { type: 'image/jpeg' });
}

const emojiByName: Record<string, string> = {
  青椒: '🫑',
  土豆: '🥔',
  番茄: '🍅',
  鸡蛋: '🥚',
  牛奶: '🥛',
  西兰花: '🥦',
  胡萝卜: '🥕',
  柠檬: '🍋',
  玉米: '🌽',
  生菜: '🥬',
  洋葱: '🧅',
  葡萄: '🍇',
};

/** Figma 39:3639：拍照识图 — 顶栏、深色取景框、底部圆形快门 + 结果确认 */
export default function FridgeRecognizePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const galleryInputId = useId();
  const [phase, setPhase] = useState<Phase>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recognized, setRecognized] = useState<RecognizedPreview[]>([]);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [streamVersion, setStreamVersion] = useState(0);

  const stopCamera = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    const v = videoRef.current;
    if (v) v.srcObject = null;
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setRecognized([]);
    setSelected(new Set());
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
    setStreamVersion((n) => n + 1);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const runRecognize = useCallback(async (file: File) => {
    setError(null);
    setPhase('recognizing');
    try {
      const list = await recognizeIngredientsFromImage(file);
      setRecognized(list);
      setSelected(new Set(list.map((_, i) => i)));
      setPhase('results');
    } catch (e) {
      const { message } = await extractApiError(e);
      setError(message);
      setPhase('idle');
    }
  }, []);

  const openGallery = useCallback(() => {
    const el = fileRef.current;
    if (!el) return;
    el.removeAttribute('capture');
    el.click();
  }, []);

  /** 进入取景页或 reset 后：拉取真实摄像头（优先后置 `environment`） */
  useEffect(() => {
    if (showResultPanel(phase) && recognized.length > 0) return;
    if (phase === 'recognizing') return;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('当前浏览器不支持访问摄像头，请用相册选图');
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const run = async () => {
        const v = videoRef.current;
        if (!v || cancelled) {
          if (!v && !cancelled) {
            setCameraError('取景组件未就绪，请刷新页面或从相册选图');
          }
          return;
        }
        setCameraError(null);
        try {
          stopMediaStream(streamRef.current);
          streamRef.current = null;
          v.srcObject = null;

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
          if (cancelled) {
            stopMediaStream(stream);
            return;
          }
          streamRef.current = stream;
          v.srcObject = stream;
          v.setAttribute('playsinline', 'true');
          v.muted = true;
          try {
            await v.play();
          } catch {
            /* 部分环境需用户手势，帧仍可能更新 */
          }
          setCameraError(null);
        } catch {
          if (!cancelled) setCameraError('无法打开摄像头，请检查权限或改用相册');
        }
      };
      void run();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase, recognized.length, streamVersion]);

  /** 离开页面或切到结果页时释放摄像头 */
  useEffect(() => {
    return () => {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (showResultPanel(phase) && recognized.length > 0) {
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      const v = videoRef.current;
      if (v) v.srcObject = null;
    }
  }, [phase, recognized.length]);

  const onShutter = useCallback(async () => {
    if (phase === 'recognizing') return;
    if (cameraError) {
      openGallery();
      return;
    }

    const v = videoRef.current;
    if (v?.srcObject) {
      if (v.readyState < 2) {
        try {
          await v.play();
        } catch {
          /* 忽略 */
        }
      }
      if (v.videoWidth < 2 || v.videoHeight < 2) {
        openGallery();
        return;
      }
      const file = captureVideoFrameToJpegFile(v);
      if (file) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
        v.srcObject = null;
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(file);
        });
        await runRecognize(file);
        return;
      }
    }

    openGallery();
  }, [phase, runRecognize, cameraError, openGallery]);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = '';
      if (!f) return;
      stopCamera();
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
      await runRecognize(f);
    },
    [runRecognize, stopCamera],
  );

  const onAddToFridge = useCallback(async () => {
    if (selected.size === 0) return;
    setError(null);
    setPhase('saving');
    try {
      for (let i = 0; i < recognized.length; i++) {
        if (!selected.has(i)) continue;
        const r = recognized[i]!;
        await createIngredientOnServer({
          name: r.name,
          category: null,
          tasteTags: r.tasteTags,
        });
      }
      router.push('/fridge/inside');
      router.refresh();
    } catch (e) {
      const { message } = await extractApiError(e);
      setError(message);
      setPhase('results');
    }
  }, [recognized, selected, router]);

  return (
    <MobileShell variant="activity" className="relative flex min-h-0 flex-1 flex-col" data-node-id="39-3639">
      <div className="flex min-h-0 flex-1 flex-col">
        <StatusBarDecor />

        <header className="flex shrink-0 items-center justify-between px-[6.15%] pb-2 pt-1">
          <Link
            href="/fridge/inside"
            className="flex items-center gap-0.5 text-sm font-semibold text-neutral-900"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
            返回
          </Link>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
            <Camera className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            识别食材
          </div>
        </header>

        <div className="mx-[6.15%] flex min-h-0 flex-1 flex-col">
          {showResultPanel(phase) && recognized.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-[40px] bg-white/90 p-4 shadow-sm ring-1 ring-black/[0.05]">
              <p className="text-sm font-semibold text-neutral-800">识别结果</p>
              <p className="text-xs text-neutral-500">勾选要加入冰箱的食材，默认全选</p>
              <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto overscroll-y-contain">
                {recognized.map((r, i) => {
                  const checked = selected.has(i);
                  return (
                    <li key={`${r.name}-${i}`}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
                          checked={checked}
                          onChange={() => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(i)) next.delete(i);
                              else next.add(i);
                              return next;
                            });
                          }}
                        />
                        <span className="text-lg">{emojiByName[r.name] ?? '🥬'}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-neutral-800">{r.name}</p>
                          <p className="text-[11px] text-neutral-500">
                            置信度 {Math.round(r.confidence * 100)}% · {r.tasteTags.join('、')}
                          </p>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={onAddToFridge}
                  disabled={selected.size === 0 || phase === 'saving'}
                  className="w-full rounded-2xl bg-gradient-cta py-3.5 text-sm font-semibold text-white shadow-glow-primary disabled:opacity-50"
                >
                  {phase === 'saving' ? '加入中…' : '加入冰箱'}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="w-full py-2 text-sm font-medium text-neutral-500"
                >
                  重新拍摄
                </button>
              </div>
            </div>
          ) : (
            <div
              className="relative flex min-h-[min(58vh,480px)] w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-[40px] bg-[#1A1A1A] text-center shadow-inner ring-1 ring-white/5"
              role="region"
              aria-label="相机取景"
            >
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                autoPlay
              />

              {previewUrl && phase === 'recognizing' ? (
                // eslint-disable-next-line @next/next/no-img-element -- 本地识别中预览 blob
                <img
                  src={previewUrl}
                  alt=""
                  className="absolute inset-0 z-[1] size-full rounded-[40px] object-cover opacity-60"
                />
              ) : null}

              {cameraError ? (
                <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 bg-black/70 px-4">
                  <p className="text-center text-sm text-neutral-200">{cameraError}</p>
                  <button
                    type="button"
                    onClick={openGallery}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white"
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden />
                    从相册选择
                  </button>
                </div>
              ) : null}

              <div
                className="pointer-events-none relative z-[1] flex min-h-[120px] flex-col items-center justify-end gap-2 bg-gradient-to-t from-black/55 to-transparent py-6 pt-20"
                aria-hidden
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-neutral-300">
                  <Camera className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                </div>
                <p className="px-4 text-sm font-medium text-neutral-300 drop-shadow">
                  {phase === 'recognizing' ? '正在识别…' : '对准食材，点击拍摄'}
                </p>
              </div>
            </div>
          )}
        </div>

        {(!showResultPanel(phase) || recognized.length === 0) ? (
          <div className="flex shrink-0 flex-col items-center gap-2 py-4">
            <div className="flex items-center justify-center gap-4">
              <label
                htmlFor={galleryInputId}
                className="cursor-pointer text-xs font-medium text-neutral-500 underline-offset-2 hover:underline"
              >
                相册
              </label>
            </div>
            <div className="flex justify-center pb-2">
              <button
                type="button"
                onClick={onShutter}
                disabled={phase === 'recognizing'}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-neutral-700 shadow-glow-primary ring-1 ring-black/[0.04] transition active:scale-[0.98] disabled:opacity-60"
                aria-label="拍摄"
              >
                <Camera className="h-9 w-9" strokeWidth={1.75} />
              </button>
            </div>
            <p className="px-4 pb-1 text-center text-[10px] text-neutral-400">
              需使用 HTTPS 或本地开发环境，并允许浏览器使用摄像头
            </p>
          </div>
        ) : null}

        {error ? <p className="px-[6.15%] pb-3 text-center text-sm text-red-600">{error}</p> : null}
      </div>

      <input
        id={galleryInputId}
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onFileChange}
      />
    </MobileShell>
  );
}

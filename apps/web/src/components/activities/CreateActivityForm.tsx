'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Minus, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type KeyboardEvent } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  CreateActivityRequestSchema,
  type CreateActivityRequest,
} from '@lin-shi/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JoinScopeSelector } from './JoinScopeSelector';
import {
  TimeQuickPicker,
  initialCustomValue,
  resolveTimeQuickPicker,
} from './TimeQuickPicker';
import type { TimeQuickOptionId } from '@/lib/time-quick-picker';
import { useCreateActivity } from '@/hooks/use-create-activity';
import { extractApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

type FormValues = CreateActivityRequest;

const DEFAULTS: FormValues = {
  title: '',
  description: '',
  startTime: '',
  location: '',
  maxParticipants: 4,
  joinScope: 'ACQUAINTANCES_ONLY',
  ingredientIds: [],
  manualIngredients: [],
};

export function CreateActivityForm() {
  const router = useRouter();
  const mutation = useCreateActivity();

  const [timeOption, setTimeOption] = useState<TimeQuickOptionId>('tonight');
  const [customTime, setCustomTime] = useState<string>(() => initialCustomValue());
  const [ingredientInput, setIngredientInput] = useState<string>('');

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateActivityRequestSchema),
    defaultValues: DEFAULTS,
    mode: 'onSubmit',
  });

  const maxParticipants = watch('maxParticipants');
  const manualIngredients = watch('manualIngredients') ?? [];

  const bumpMax = (delta: number): void => {
    const next = Math.min(10, Math.max(2, (maxParticipants ?? 4) + delta));
    setValue('maxParticipants', next, { shouldDirty: true });
  };

  const addIngredient = (): void => {
    const v = ingredientInput.trim();
    if (!v) return;
    if (manualIngredients.includes(v)) {
      setIngredientInput('');
      return;
    }
    if (manualIngredients.length >= 20) {
      toast.info('最多添加 20 个食材');
      return;
    }
    if (v.length > 50) {
      toast.error('食材名最多 50 个字');
      return;
    }
    setValue('manualIngredients', [...manualIngredients, v], {
      shouldDirty: true,
    });
    setIngredientInput('');
  };

  const removeIngredient = (name: string): void => {
    setValue(
      'manualIngredients',
      manualIngredients.filter((n) => n !== name),
      { shouldDirty: true },
    );
  };

  const onIngredientKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const submit = handleSubmit(async (values) => {
    const iso = resolveTimeQuickPicker(timeOption, customTime);
    if (!iso) {
      toast.error('请选择活动时间');
      return;
    }
    try {
      const detail = await mutation.mutateAsync({
        ...values,
        startTime: iso,
        description: values.description?.trim() ? values.description : null,
      });
      toast.success('开锅成功！🔥');
      router.push('/activities');
    } catch (err) {
      const api = await extractApiError(err);
      if (api?.code === 'ACTIVITY_START_IN_PAST') {
        toast.error('开饭时间不能是过去');
      } else {
        toast.error(api?.message ?? '起锅失败，请重试');
      }
    }
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pb-24">
      {/* Card 1 — title */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label htmlFor="title">这锅做什么？</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="起个锅名，比如「今晚煮面」"
          invalid={Boolean(errors.title)}
          className="mt-2"
        />
        {errors.title ? (
          <p className="mt-1 text-[12px] text-danger-500">{errors.title.message}</p>
        ) : null}
      </section>

      {/* Card 2 — time */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label>时间</Label>
        <div className="mt-2">
          <TimeQuickPicker
            selected={timeOption}
            customValue={customTime}
            onSelect={setTimeOption}
            onCustomChange={setCustomTime}
          />
        </div>
      </section>

      {/* Card 3 — location */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label htmlFor="location">地点</Label>
        <textarea
          id="location"
          {...register('location')}
          rows={2}
          placeholder="例如：杨浦区国定路某大学宿舍楼"
          className={cn(
            'mt-2 w-full rounded-lg border bg-neutral-100 px-4 py-3 text-[15px] text-neutral-900',
            'placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/60',
            errors.location ? 'border-danger-500' : 'border-transparent',
          )}
        />
        {errors.location ? (
          <p className="mt-1 text-[12px] text-danger-500">
            {errors.location.message}
          </p>
        ) : null}
      </section>

      {/* Card 4 — max participants */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label>人数上限</Label>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => bumpMax(-1)}
            aria-label="减少"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-40"
            disabled={maxParticipants <= 2}
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[22px] font-bold text-neutral-900">
                {maxParticipants}
              </span>
              <span className="text-[12px] text-neutral-500">2 - 10 人</span>
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 flex-1 rounded-full',
                    i < maxParticipants
                      ? 'bg-accent-peach-500'
                      : 'bg-neutral-200',
                  )}
                  aria-hidden
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => bumpMax(1)}
            aria-label="增加"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40"
            disabled={maxParticipants >= 10}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Card 5 — ingredients (manual fallback, B empty) */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label>我带的食材（从冰箱选）</Label>
        <p className="mt-1 text-[12px] text-neutral-500">
          冰箱还没有食材 · 先去拍照识别 →
        </p>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="输入食材名，回车添加"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={onIngredientKeyDown}
            maxLength={50}
            aria-label="添加食材"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={addIngredient}
            className="shrink-0"
          >
            添加
          </Button>
        </div>
        {manualIngredients.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {manualIngredients.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full border border-accent-peach-400/30 bg-accent-peach-400/20 px-3 py-1 text-[12px] text-neutral-900"
              >
                {name}
                <button
                  type="button"
                  aria-label={`移除 ${name}`}
                  onClick={() => removeIngredient(name)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-neutral-200"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </section>

      {/* Card 6 — join scope */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label>加入范围</Label>
        <p className="mt-1 text-[12px] text-neutral-500">
          决定谁能看到并加入这锅
        </p>
        <div className="mt-3">
          <Controller
            control={control}
            name="joinScope"
            render={({ field }) => (
              <JoinScopeSelector value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      </section>

      {/* Card 7 — description */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <Label htmlFor="description">补充说明</Label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          placeholder="一句话说说氛围或要求..."
          className={cn(
            'mt-2 w-full rounded-lg border bg-neutral-100 px-4 py-3 text-[15px] text-neutral-900',
            'placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/60',
            errors.description ? 'border-danger-500' : 'border-transparent',
          )}
        />
      </section>

      {/* Sticky submit */}
      <div className="fixed inset-x-0 bottom-[15px] z-10 px-5">
        <div className="mx-auto max-w-md">
          <Button
            type="submit"
            variant="gradient"
            size="xl"
            full
            disabled={isSubmitting || mutation.isPending}
          >
            {mutation.isPending ? '开锅中...' : '开锅！🔥'}
          </Button>
        </div>
      </div>
    </form>
  );
}

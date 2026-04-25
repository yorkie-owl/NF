'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { type FriendPreferences } from '@lin-shi/contracts';
import { SaveBar } from '@/components/common/SaveBar';
import { TimeSlotPicker } from '@/components/common/TimeSlotPicker';
import { UnsavedChangesDialog } from '@/components/common/UnsavedChangesDialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  useFriendPreferences,
  useUpdateFriendPreferences,
} from '@/hooks/use-friend-preferences';
import { extractApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import {
  detectPresets,
  expandPresets,
  type TimeSlotPresetId,
} from '@/lib/time-slot-presets';

export default function FriendPreferencesPage() {
  const router = useRouter();
  const { data, isLoading } = useFriendPreferences();
  const update = useUpdateFriendPreferences();

  const [acceptStrangers, setAcceptStrangers] = useState(true);
  const [distanceKm, setDistanceKm] = useState(5);
  const [presets, setPresets] = useState<TimeSlotPresetId[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (data && !loaded) {
      setAcceptStrangers(data.acceptStrangers);
      setDistanceKm(data.distanceKm);
      setPresets(detectPresets(data.timeSlots));
      setLoaded(true);
    }
  }, [data, loaded]);

  const dirty = useMemo(() => {
    if (!data || !loaded) return false;
    if (data.acceptStrangers !== acceptStrangers) return true;
    if (data.distanceKm !== distanceKm) return true;
    const newPresets = new Set(presets);
    const oldPresets = new Set(detectPresets(data.timeSlots));
    if (newPresets.size !== oldPresets.size) return true;
    for (const p of newPresets) if (!oldPresets.has(p)) return true;
    return false;
  }, [data, loaded, acceptStrangers, distanceKm, presets]);

  const tryGoBack = () => {
    if (dirty) setConfirmLeave(true);
    else router.back();
  };

  const onSave = async () => {
    const payload: FriendPreferences = {
      acceptStrangers,
      distanceKm,
      timeSlots: expandPresets(presets),
    };
    try {
      await update.mutateAsync(payload);
      toast.success('协作偏好已更新');
      router.replace('/profile');
    } catch (err) {
      const apiErr = await extractApiError(err);
      if (apiErr?.code === 'PREF_DISTANCE_OUT_OF_RANGE') {
        toast.error('距离超出范围');
      } else {
        toast.error(apiErr?.message ?? '保存失败');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-[14px] text-neutral-500">
        加载中…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-32 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={tryGoBack}
          aria-label="返回"
          className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
        >
          <ChevronLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <h1 className="text-[20px] font-semibold text-neutral-900">
          协作偏好（社交）
        </h1>
      </div>

      <section className="mt-5 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[15px] font-medium text-neutral-900">
              接受陌生人
            </p>
            <p className="mt-1 text-[12px] text-neutral-500">
              允许完全陌生的 OPC 加入我的局
            </p>
          </div>
          <Switch
            checked={acceptStrangers}
            onCheckedChange={setAcceptStrangers}
            aria-label="是否接受陌生人"
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium text-neutral-900">距离范围</p>
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[12px] font-semibold text-brand-700 tabular-nums">
            {distanceKm}km 以内
          </span>
        </div>
        <div className="mt-4">
          <Slider
            value={distanceKm}
            min={1}
            max={50}
            onChange={setDistanceKm}
            aria-label="距离范围，千米"
          />
          <div className="mt-1 flex justify-between text-[11px] text-neutral-400 tabular-nums">
            <span>1km</span>
            <span>50km</span>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
        <p className="text-[15px] font-medium text-neutral-900">时间偏好</p>
        <p className="mt-1 text-[12px] text-neutral-500">
          选择你平时愿意参与协作的时段
        </p>
        <div className="mt-4">
          <TimeSlotPicker value={presets} onChange={setPresets} />
        </div>
      </section>

      <SaveBar
        visible={dirty}
        saving={update.isPending}
        onSave={onSave}
      />

      <UnsavedChangesDialog
        open={confirmLeave}
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          router.back();
        }}
      />
    </div>
  );
}

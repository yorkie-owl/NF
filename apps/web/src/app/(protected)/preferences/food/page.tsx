'use client';

import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  CookingSkillEnum,
  CuisineEnum,
  DietaryRestrictionEnum,
  type CookingSkill,
  type Cuisine,
  type DietaryRestriction,
  type FoodPreferences,
} from '@lin-shi/contracts';
import {
  EnumChipMultiSelect,
  EnumChipSingleSelect,
} from '@/components/common/EnumChipMultiSelect';
import { SaveBar } from '@/components/common/SaveBar';
import { UnsavedChangesDialog } from '@/components/common/UnsavedChangesDialog';
import {
  useFoodPreferences,
  useUpdateFoodPreferences,
} from '@/hooks/use-food-preferences';
import { extractApiError } from '@/lib/api';
import {
  CookingSkillLabel,
  CuisineLabel,
  DietaryLabel,
} from '@/lib/enum-labels';
import { toast } from '@/lib/toast';

const CUISINE_OPTIONS = CuisineEnum.options.map((value: Cuisine) => ({
  value,
  label: CuisineLabel[value],
}));
const DIETARY_OPTIONS = DietaryRestrictionEnum.options.map(
  (value: DietaryRestriction) => ({
    value,
    label: DietaryLabel[value],
  }),
);
const SKILL_OPTIONS = CookingSkillEnum.options.map((value: CookingSkill) => ({
  value,
  label: CookingSkillLabel[value],
}));

function sameSet<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  for (const x of b) if (!set.has(x)) return false;
  return true;
}

export default function FoodPreferencesPage() {
  const router = useRouter();
  const { data, isLoading } = useFoodPreferences();
  const update = useUpdateFoodPreferences();

  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [dietary, setDietary] = useState<DietaryRestriction[]>([]);
  const [skill, setSkill] = useState<CookingSkill>('INTERMEDIATE');
  const [loaded, setLoaded] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  useEffect(() => {
    if (data && !loaded) {
      setCuisines(data.cuisines);
      setDietary(data.dietaryRestrictions);
      setSkill(data.cookingSkill);
      setLoaded(true);
    }
  }, [data, loaded]);

  const dirty = useMemo(() => {
    if (!data || !loaded) return false;
    if (data.cookingSkill !== skill) return true;
    if (!sameSet(data.cuisines, cuisines)) return true;
    if (!sameSet(data.dietaryRestrictions, dietary)) return true;
    return false;
  }, [data, loaded, cuisines, dietary, skill]);

  const tryGoBack = () => {
    if (dirty) setConfirmLeave(true);
    else router.back();
  };

  const onSave = async () => {
    const payload: FoodPreferences = {
      cuisines,
      dietaryRestrictions: dietary,
      cookingSkill: skill,
    };
    try {
      await update.mutateAsync(payload);
      toast.success('食物偏好已更新');
      router.replace('/profile');
    } catch (err) {
      const apiErr = await extractApiError(err);
      toast.error(apiErr?.message ?? '保存失败');
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
          食物偏好
        </h1>
      </div>

      <section className="mt-5 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium text-neutral-900">
            常吃菜系
          </p>
          <span className="text-[11px] text-neutral-400 tabular-nums">
            {cuisines.length} / 10
          </span>
        </div>
        <p className="mt-1 text-[12px] text-neutral-500">最多选 10 种</p>
        <div className="mt-4">
          <EnumChipMultiSelect
            options={CUISINE_OPTIONS}
            value={cuisines}
            onChange={setCuisines}
            max={10}
            tone="peach"
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium text-neutral-900">
            饮食限制
          </p>
          <span className="text-[11px] text-neutral-400 tabular-nums">
            {dietary.length} / 10
          </span>
        </div>
        <div className="mt-4">
          <EnumChipMultiSelect
            options={DIETARY_OPTIONS}
            value={dietary}
            onChange={setDietary}
            max={10}
            tone="brand"
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/70 bg-white/70 p-5 shadow-sm backdrop-blur">
        <p className="text-[15px] font-medium text-neutral-900">做饭水平</p>
        <div className="mt-4">
          <EnumChipSingleSelect
            options={SKILL_OPTIONS}
            value={skill}
            onChange={setSkill}
            tone="success"
          />
        </div>
      </section>

      <SaveBar visible={dirty} saving={update.isPending} onSave={onSave} />

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

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type UpdateProfileRequest } from '@lin-shi/contracts';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SaveBar } from '@/components/common/SaveBar';
import { UnsavedChangesDialog } from '@/components/common/UnsavedChangesDialog';
import {
  useUpdateProfile,
  useUploadAvatar,
} from '@/hooks/use-update-profile';
import { useMe } from '@/hooks/use-me';
import { extractApiError } from '@/lib/api';
import { toast } from '@/lib/toast';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

const EditSchema = z.object({
  nickname: z.string().min(1, '昵称不能为空').max(20, '昵称最多 20 字'),
  school: z
    .string()
    .max(100, '学校最多 100 字')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(50, '城市最多 50 字')
    .optional()
    .or(z.literal('')),
  bio: z.string().max(140, '一句话最多 140 字').optional().or(z.literal('')),
});
type EditForm = z.infer<typeof EditSchema>;

function toNullable(v: string | undefined): string | null {
  const s = (v ?? '').trim();
  return s.length === 0 ? null : s;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const me = useMe();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditForm>({
    resolver: zodResolver(EditSchema),
    mode: 'onBlur',
    defaultValues: { nickname: '', school: '', city: '', bio: '' },
  });

  useEffect(() => {
    if (me.data) {
      reset({
        nickname: me.data.nickname,
        school: me.data.school ?? '',
        city: me.data.city ?? '',
        bio: me.data.bio ?? '',
      });
      setAvatarPreview(me.data.avatarUrl);
    }
  }, [me.data, reset]);

  // warn on tab close when dirty
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const bioValue = watch('bio') ?? '';

  const onAvatarPick = async (file: File) => {
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error('仅支持 JPG / PNG / WebP');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('图片超过 2MB，换一张吧');
      return;
    }
    // Optimistic preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success('头像已更新');
    } catch (err) {
      const apiErr = await extractApiError(err);
      if (apiErr?.code === 'USER_AVATAR_TOO_LARGE') {
        toast.error('图片超过 2MB');
      } else if (apiErr?.code === 'USER_AVATAR_BAD_FORMAT') {
        toast.error('图片格式不支持');
      } else {
        toast.error('上传失败，请稍后再试');
      }
      // restore previous
      setAvatarPreview(me.data?.avatarUrl ?? null);
    }
  };

  const onSubmit = async (data: EditForm) => {
    const payload: UpdateProfileRequest = {
      nickname: data.nickname,
      school: toNullable(data.school),
      city: toNullable(data.city),
      bio: toNullable(data.bio),
    };
    try {
      await updateProfile.mutateAsync(payload);
      toast.success('已保存');
      router.replace('/profile');
    } catch (err) {
      const apiErr = await extractApiError(err);
      if (apiErr?.code === 'USER_NICKNAME_INVALID') {
        toast.error('昵称不合法');
      } else {
        toast.error(apiErr?.message ?? '保存失败，请稍后再试');
      }
    }
  };

  const tryGoBack = () => {
    if (isDirty) setConfirmLeave(true);
    else router.back();
  };

  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-4">
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
          编辑资料
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
        {/* Avatar */}
        <section className="flex flex-col items-center rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-500">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="头像预览"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onAvatarPick(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="mt-3 rounded-full bg-neutral-100 px-4 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-60"
          >
            {uploadAvatar.isPending ? '上传中…' : '更换头像'}
          </button>
          <p className="mt-1 text-[11px] text-neutral-400">
            JPG / PNG / WebP，最大 2MB
          </p>
        </section>

        {/* Form */}
        <section className="mt-4 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <Field
            id="nickname"
            label="昵称"
            error={errors.nickname?.message}
          >
            <Input
              id="nickname"
              placeholder="叫我什么好呢"
              invalid={Boolean(errors.nickname)}
              {...register('nickname')}
            />
          </Field>
          <Field id="school" label="学校" error={errors.school?.message}>
            <Input
              id="school"
              placeholder="如 同济大学"
              invalid={Boolean(errors.school)}
              {...register('school')}
            />
          </Field>
          <Field id="city" label="城市" error={errors.city?.message}>
            <Input
              id="city"
              placeholder="如 上海·杨浦区"
              invalid={Boolean(errors.city)}
              {...register('city')}
            />
          </Field>
          <Field id="bio" label="一句话" error={errors.bio?.message}>
            <Input
              id="bio"
              placeholder="喜欢钻研菜谱，下班了就做饭"
              invalid={Boolean(errors.bio)}
              {...register('bio')}
            />
            <p className="mt-1 text-right text-[11px] text-neutral-400 tabular-nums">
              {bioValue.length} / 140
            </p>
          </Field>
        </section>

        <SaveBar visible={isDirty} saving={isSubmitting} onSave={() => void handleSubmit(onSubmit)()} />
      </form>

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


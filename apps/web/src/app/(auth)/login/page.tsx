'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  INVITE_CODE_REGEX,
  LoginRequestSchema,
  RegisterRequestSchema,
  type LoginRequest,
  type RegisterRequest,
} from '@lin-shi/contracts';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/hooks/use-login';
import { useRegister } from '@/hooks/use-register';
import { extractApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { cn } from '@/lib/cn';
import { normalizeInviteCode } from '@/lib/invite-code-validator';
import { toast } from '@/lib/toast';

type Step = 'invite' | 'auth';
type AuthMode = 'register' | 'login';

const InviteSchema = z.object({
  inviteCode: z
    .string()
    .length(10, '邀请码格式：LINSH-XXXX')
    .regex(INVITE_CODE_REGEX, '邀请码格式不对，再看看？'),
});
type InviteForm = z.infer<typeof InviteSchema>;

const AuthSchema = z.object({
  email: z.string().email('邮箱格式不对'),
  password: z.string().min(8, '密码至少 8 位').max(64),
  nickname: z.string().max(20, '昵称最多 20 字').optional(),
});
type AuthForm = z.infer<typeof AuthSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('invite');
  const [mode, setMode] = useState<AuthMode>('register');
  const [inviteCode, setInviteCode] = useState<string>('');

  useEffect(() => {
    // Already logged in? Bounce to profile.
    if (getAccessToken()) router.replace('/profile');
  }, [router]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur">
      <AnimatePresence mode="wait" initial={false}>
        {step === 'invite' ? (
          <motion.div
            key="invite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="p-7"
          >
            <InviteStep
              onValid={(code) => {
                setInviteCode(code);
                setMode('register');
                setStep('auth');
              }}
              onSkipToLogin={() => {
                setInviteCode('');
                setMode('login');
                setStep('auth');
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="p-7"
          >
            <AuthStep
              mode={mode}
              setMode={setMode}
              inviteCode={inviteCode}
              onBack={() => setStep('invite')}
              onSuccess={() => router.replace('/profile')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InviteStep({
  onValid,
  onSkipToLogin,
}: {
  onValid: (code: string) => void;
  onSkipToLogin: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InviteForm>({
    resolver: zodResolver(InviteSchema),
    mode: 'onBlur',
    defaultValues: { inviteCode: '' },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => onValid(normalizeInviteCode(d.inviteCode)))}
    >
      <h1 className="text-[22px] font-bold text-neutral-900">
        <span aria-hidden>🧊 </span>打开你的冰箱
      </h1>
      <p className="mt-1 text-[14px] text-neutral-500">
        输入邀请码，注册账号，加入邻食
      </p>

      <div className="mt-6">
        <Label htmlFor="inviteCode" className="sr-only">
          邀请码
        </Label>
        <Input
          id="inviteCode"
          placeholder="请输入邀请码"
          autoCapitalize="characters"
          autoComplete="off"
          className="h-14 text-center tracking-widest text-[18px] font-semibold tabular-nums"
          invalid={Boolean(errors.inviteCode)}
          {...register('inviteCode', {
            onChange: (e) =>
              setValue('inviteCode', normalizeInviteCode(e.target.value)),
          })}
        />
        {errors.inviteCode ? (
          <p className="mt-2 inline-flex rounded-full bg-danger-100 px-3 py-1 text-[12px] font-medium text-danger-500">
            · {errors.inviteCode.message}
          </p>
        ) : (
          <p className="mt-2 inline-flex rounded-full bg-brand-100 px-3 py-1 text-[12px] font-medium text-brand-700">
            · 每人限量 3 个邀请名额
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        size="xl"
        full
        className="mt-6 bg-gradient-cta"
      >
        进入冰箱 →
      </Button>

      <div className="mt-4 text-center text-[13px]">
        <button
          type="button"
          onClick={onSkipToLogin}
          className="text-neutral-500 hover:text-brand-500"
        >
          已有账号？直接登录
        </button>
      </div>
      <p className="mt-2 text-center text-[12px] text-neutral-400">
        还没有邀请码？联系已有用户获取
      </p>
    </form>
  );
}

function AuthStep({
  mode,
  setMode,
  inviteCode,
  onBack,
  onSuccess,
}: {
  mode: AuthMode;
  setMode: (m: AuthMode) => void;
  inviteCode: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const login = useLogin();
  const register_ = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AuthForm>({
    resolver: zodResolver(AuthSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', nickname: '' },
  });

  useEffect(() => {
    reset({ email: '', password: '', nickname: '' });
  }, [mode, reset]);

  const onSubmit = async (data: AuthForm) => {
    try {
      if (mode === 'register') {
        const payload: RegisterRequest = RegisterRequestSchema.parse({
          email: data.email,
          password: data.password,
          nickname: data.nickname ?? '',
          inviteCode,
        });
        await register_.mutateAsync(payload);
        toast.success('欢迎加入邻食 🍳');
      } else {
        const payload: LoginRequest = LoginRequestSchema.parse({
          email: data.email,
          password: data.password,
        });
        await login.mutateAsync(payload);
        toast.success('欢迎回来 👋');
      }
      onSuccess();
    } catch (err) {
      const api = await extractApiError(err);
      if (api?.code === 'INVITE_CONSUMED') {
        toast.error('邀请码已用完');
      } else if (api?.code === 'INVITE_INVALID') {
        toast.error('邀请码无效');
      } else if (api?.code === 'AUTH_EMAIL_TAKEN') {
        toast.error('此邮箱已注册，请去登录');
        setMode('login');
      } else if (api?.code === 'AUTH_INVALID_CREDENTIALS') {
        toast.error('邮箱或密码错误');
      } else if (api) {
        toast.error(api.message || '出错了，请稍后再试');
      } else {
        toast.error('网络异常，请稍后再试');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-neutral-500 hover:text-brand-500"
        >
          ← 返回
        </button>
        {inviteCode ? (
          <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-medium text-brand-700 tabular-nums">
            {inviteCode}
          </span>
        ) : null}
      </div>

      <div className="mt-4 inline-flex rounded-full bg-neutral-100 p-1">
        <TabBtn
          selected={mode === 'register'}
          onClick={() => setMode('register')}
          disabled={!inviteCode}
        >
          注册
        </TabBtn>
        <TabBtn
          selected={mode === 'login'}
          onClick={() => setMode('login')}
        >
          登录
        </TabBtn>
      </div>

      {mode === 'register' && !inviteCode ? (
        <p className="mt-3 text-[12px] text-danger-500">
          注册需要邀请码，请先返回输入。
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        {mode === 'register' ? (
          <Field
            id="nickname"
            label="昵称"
            error={errors.nickname?.message}
          >
            <Input
              id="nickname"
              placeholder="给自己取个名字"
              invalid={Boolean(errors.nickname)}
              {...register('nickname')}
            />
          </Field>
        ) : null}

        <Field id="email" label="邮箱" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </Field>

        <Field id="password" label="密码" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            placeholder="至少 8 位"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </Field>
      </div>

      <Button
        type="submit"
        variant="gradient"
        size="xl"
        full
        disabled={isSubmitting || (mode === 'register' && !inviteCode)}
        className="mt-6"
      >
        {mode === 'register' ? '加入邻食 🍳' : '登录'}
      </Button>
    </form>
  );
}

function TabBtn({
  selected,
  onClick,
  disabled,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full px-5 py-1.5 text-[13px] font-semibold transition-colors',
        selected ? 'bg-white text-neutral-900 shadow' : 'text-neutral-500',
        disabled && 'opacity-40',
      )}
    >
      {children}
    </button>
  );
}


'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CreateActivityForm } from '@/components/activities/CreateActivityForm';

export default function NewActivityPage() {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-md px-5 pb-6 pt-6">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="返回"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm hover:bg-neutral-100"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-700" />
        </button>
        <h1 className="text-[22px] font-bold text-neutral-900">立局</h1>
      </header>
      <p className="mt-1 text-[13px] text-neutral-500">
        填满这 7 张卡片，邀请协作伙伴一起开桌 🤝
      </p>
      <div className="mt-4">
        <CreateActivityForm />
      </div>
    </div>
  );
}

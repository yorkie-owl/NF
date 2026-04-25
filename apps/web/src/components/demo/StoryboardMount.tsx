'use client';

import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const StoryboardDriver = dynamic(
  () => import('./StoryboardDriver').then((m) => m.StoryboardDriver),
  { ssr: false },
);

function Inner() {
  const sp = useSearchParams();
  if (sp.get('demo') !== '1') return null;
  return <StoryboardDriver />;
}

export function StoryboardMount() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}

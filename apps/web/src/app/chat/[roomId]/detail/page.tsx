'use client';

import { useSearchParams } from 'next/navigation';
import RoomDetail from '@/components/chat/room-detail';

interface RoomDetailPageProps {
  params: {
    roomId: string;
  };
}

export default function RoomDetailPage({ params }: RoomDetailPageProps) {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || '活动详情';

  return <RoomDetail roomId={params.roomId} title={title} />;
}

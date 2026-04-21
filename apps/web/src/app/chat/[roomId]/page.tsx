'use client';

import { useSearchParams } from 'next/navigation';
import ChatRoom from '@/components/chat/chat-room';

interface ChatPageProps {
  params: {
    roomId: string;
  };
}

export default function ChatRoomPage({ params }: ChatPageProps) {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || '聊天';

  return <ChatRoom roomId={params.roomId} title={title} />;
}

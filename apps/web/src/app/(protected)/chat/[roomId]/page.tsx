// E板块：聊天室（Figma 图10），my_chat 和 chat_list 共用入口
import ChatRoom from '@/components/chat/chat-room';

interface Props {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ title?: string }>;
}

export default async function ChatRoomPage({ params, searchParams }: Props) {
  const { roomId } = await params;
  const { title } = await searchParams;
  return <ChatRoom roomId={roomId} title={title ?? '聊天室'} />;
}

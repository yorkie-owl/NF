// E板块：聊天室活动详情（Figma 图12），从图10 右上角 icon 进入
import RoomDetail from '@/components/chat/room-detail';

interface Props {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ title?: string }>;
}

export default async function RoomDetailPage({ params, searchParams }: Props) {
  const { roomId } = await params;
  const { title } = await searchParams;
  return <RoomDetail roomId={roomId} title={title ?? '活动详情'} />;
}

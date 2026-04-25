'use client';

// 图6：我的锅 — 我参与的聊天活动列表
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/common/status-bar';

type ActivityStatus = '进行中' | '快开始' | '招募中';

interface MyChatRoom {
  id: string;
  title: string;
  role: string;
  location: string;
  time: string;
  emoji: string;
  current: number;
  max: number;
  status: ActivityStatus;
}

const MOCK_ROOMS: MyChatRoom[] = [
  {
    id: 'room-1',
    title: '咖啡馆 MVP 拼桌',
    role: '发起人',
    location: '线上 · Zoom + Figma',
    time: '今晚 7:00',
    emoji: '💡',
    current: 2,
    max: 3,
    status: '进行中',
  },
  {
    id: 'room-2',
    title: '周末播客交换学',
    role: '参与者',
    location: '南山创客中心',
    time: '周六下午 3:00',
    emoji: '🎙️',
    current: 4,
    max: 5,
    status: '快开始',
  },
  {
    id: 'room-3',
    title: '内容互评工作坊',
    role: '发起人',
    location: '天河共享空间',
    time: '明晚 6:30',
    emoji: '✍️',
    current: 1,
    max: 4,
    status: '招募中',
  },
];

const STATUS_STYLES: Record<ActivityStatus, string> = {
  '进行中': 'text-green-600 bg-green-50',
  '快开始': 'text-[#F5A623] bg-pink-50',
  '招募中': 'text-pink-500 bg-pink-50',
};

export default function MyChatList() {
  const router = useRouter();

  return (
    <div className="flex flex-col bg-[#FFF5F7] min-h-full">

      <StatusBar />

      {/* 导航栏 */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h1 className="text-[18px] font-bold text-gray-900">我的锅</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
          <svg width="18" height="4" viewBox="0 0 18 4" fill="currentColor">
            <circle cx="2" cy="2" r="2"/>
            <circle cx="9" cy="2" r="2"/>
            <circle cx="16" cy="2" r="2"/>
          </svg>
        </button>
      </div>

      {/* 活动列表 */}
      <div className="flex-1 px-4 py-2 space-y-3">
        {MOCK_ROOMS.map((room) => {
          const filledBars = Math.round((room.current / room.max) * 5);
          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* 图标 */}
                <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-2xl shrink-0">
                  {room.emoji}
                </div>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[15px] font-semibold text-gray-900 truncate">{room.title}</p>
                    <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[room.status]}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{room.role} · {room.location}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[12px] text-gray-500">
                    <span>📅 {room.time}</span>
                    <span>📍 {room.location}</span>
                  </div>
                </div>
              </div>

              {/* 进度 + 按钮 */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-6 rounded-full ${i < filledBars ? 'bg-[#FF7A9A]' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[12px] text-gray-500">{room.current}/{room.max} 人</span>
                </div>
                <button
                  onClick={() => router.push(`/chat/${room.id}?title=${encodeURIComponent(room.title)}`)}
                  aria-label={`进入 ${room.title} 聊天室`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF7A9A] text-white active:opacity-80 transition-opacity"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

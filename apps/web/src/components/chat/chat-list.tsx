'use client';

// 图7/8/9：这几锅饭 — 按状态分 tab 的全局聊天列表
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/common/status-bar';

type TabKey = '全部' | '未读' | '进行中' | '快开始';
type ActivityStatus = '进行中' | '快开始' | '招募中';

interface ChatPreview {
  id: string;
  title: string;
  emoji: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: ActivityStatus;
}

const MOCK_CHATS: ChatPreview[] = [
  {
    id: 'room-1',
    title: '今晚煮面',
    emoji: '🍜',
    lastMessage: '柴桥子：我带面条，你带番茄鸡蛋哈～',
    time: '2分钟前',
    unread: 3,
    status: '进行中',
  },
  {
    id: 'room-2',
    title: '周末饺子局',
    emoji: '🥟',
    lastMessage: '系统：小林加入了锅',
    time: '30分钟前',
    unread: 0,
    status: '快开始',
  },
  {
    id: 'room-3',
    title: '素食酸汤锅',
    emoji: '🥬',
    lastMessage: '系统：你发起了这锅，等待好友加入',
    time: '昨天',
    unread: 0,
    status: '招募中',
  },
];

const TABS: TabKey[] = ['全部', '未读', '进行中', '快开始'];

const STATUS_STYLES: Record<ActivityStatus, string> = {
  '进行中': 'text-emerald-600 bg-emerald-50',
  '快开始': 'text-rose-500 bg-rose-50',
  '招募中': 'text-gray-400 bg-gray-100',
};

const TAB_FILTER: Record<TabKey, (c: ChatPreview) => boolean> = {
  '全部': () => true,
  '未读': (c) => c.unread > 0,
  '进行中': (c) => c.status === '进行中',
  '快开始': (c) => c.status === '快开始',
};

export default function ChatList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('全部');

  const filtered = MOCK_CHATS.filter(TAB_FILTER[activeTab]);

  return (
    <div className="flex flex-col min-h-full" style={{ background: 'linear-gradient(to bottom, #FFF5F7 0%, #FDF6F8 50%, #FAFAFA 100%)' }}>

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
        <h1 className="text-[18px] font-bold text-gray-900">这几锅饭</h1>
        <div className="w-9 h-9" />
      </div>

      {/* Tab 栏 */}
      <div className="flex gap-2 px-4 pb-3 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#FF7A9A] text-white'
                : 'bg-white text-gray-500 border border-pink-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 聊天列表 */}
      <div className="flex-1 px-4 space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-[14px]">暂无相关聊天</p>
          </div>
        )}
        {filtered.map((chat) => (
          <button
            key={chat.id}
            onClick={() => router.push(`/chat/${chat.id}?title=${encodeURIComponent(chat.title)}`)}
            className="w-full bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 active:bg-pink-50 transition-colors text-left"
          >
            {/* 头像 + 未读角标 */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-2xl">
                {chat.emoji}
              </div>
              {chat.unread > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF7A9A] rounded-full flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{chat.unread}</span>
                </div>
              )}
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-[15px] font-semibold text-gray-900 truncate">{chat.title}</p>
                <span className="shrink-0 text-[11px] text-gray-400">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-gray-400 truncate">{chat.lastMessage}</p>
                <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[chat.status]}`}>
                  {chat.status}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

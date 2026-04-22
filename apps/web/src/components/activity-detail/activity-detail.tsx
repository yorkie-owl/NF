'use client';

// 图7-15：活动详情页
// Figma: fileKey=sVwVM1yIkQApx7J1STcbyh, nodeId=42:4715
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Participant {
  id: string;
  name: string;
  role: '锅主' | '参与者';
  avatar: string;
  ingredients: string[];
}

interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  time: string;
}

const MOCK_ACTIVITY = {
  title: '周末包饺子局',
  subtitle: '参与者 · 静安区',
  time: '周六 15:00',
  location: '静安区',
  currentCount: 4,
  maxCount: 5,
  recommendedDish: '猪肉白菜饺子',
  recommendedReason: '周雨有面皮🥟，你有白菜🥬洋葱🧅',
  participants: [
    { id: '1', name: '我', role: '锅主' as const, avatar: '👩', ingredients: ['🍅', '🥚'] },
    { id: '2', name: '柴桥子', role: '参与者' as const, avatar: '👩', ingredients: ['🧄'] },
  ] satisfies Participant[],
  events: [
    { id: '1', actor: '小林', action: '加入了锅', time: '2小时前' },
    { id: '2', actor: '系统', action: '推荐了 番茄鸡蛋面 ✨', time: '2小时前' },
    { id: '3', actor: '周雨', action: '发起了这锅', time: '3小时前' },
  ] satisfies ActivityEvent[],
};

export default function ActivityDetail() {
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(false);
  const activity = MOCK_ACTIVITY;
  const remaining = activity.maxCount - (isJoined ? activity.currentCount : activity.currentCount); // Simplified for mock

  return (
    <div className="bg-[#F9F5F0] relative pb-24">

        {/* 状态栏 */}
        <div className="flex justify-between items-center px-6 pt-3 pb-1">
          <span className="text-sm font-semibold">9:41</span>
          <div className="flex items-center gap-1 text-xs">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* 顶部导航 */}
        <div className="flex items-center justify-between px-4 py-3">
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-[17px] font-semibold text-gray-900">{activity.title}</h1>
            <p className="text-[12px] text-gray-500 mt-0.5">{activity.subtitle}</p>
          </div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
        </div>

        <div className="px-4 space-y-3">

          {/* 活动基本信息卡 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[14px] text-gray-700">
                <span>📅</span>
                <span className="font-medium">{activity.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[14px] text-gray-700">
                <span>📍</span>
                <span>{activity.location}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-[15px] font-bold text-[#F5A623]">
                {activity.currentCount}/{activity.maxCount} 人已加入
              </span>
            </div>
          </div>

          {/* 系统推荐菜 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] font-medium text-gray-500">🔍 系统推荐菜</span>
            </div>
            <p className="text-[16px] font-semibold text-gray-900">{activity.recommendedDish}</p>
            <p className="text-[13px] text-gray-500 mt-1">{activity.recommendedReason}</p>
          </div>

          {/* 参与者 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[15px] font-semibold text-gray-900">
                👥 参与者（{activity.currentCount}/{activity.maxCount}）
              </span>
            </div>
            <div className="space-y-3">
              {activity.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3E0] flex items-center justify-center text-xl">
                      {p.avatar}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-gray-900">{p.name}</p>
                      <p className="text-[12px] text-gray-500">{p.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 text-xl">
                    {p.ingredients.map((ing, i) => (
                      <span key={i}>{ing}</span>
                    ))}
                  </div>
                </div>
              ))}

              {/* 空位 */}
              {remaining > 0 && (
                <div className="border border-dashed border-gray-200 rounded-xl py-3 text-center">
                  <p className="text-[13px] text-gray-400">
                    还差 {remaining} 人，等待食友加入...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 动态 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[15px] font-semibold text-gray-900">📋 动态</span>
            </div>
            <div className="space-y-3">
              {activity.events.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#F5A623] shrink-0" />
                  <div>
                    <p className="text-[14px] text-gray-800">
                      <span className="font-medium">{event.actor}</span>
                      {' '}{event.action}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 底部固定按钮 */}
        <div className="sticky bottom-0 w-full px-4 pb-6 pt-3 bg-gradient-to-t from-[#F9F5F0] to-transparent">
          {isJoined ? (
            <button
              onClick={() => router.push('/chat/room-2?title=' + encodeURIComponent(activity.title))}
              className="w-full py-4 bg-[#FF7A9A] text-white text-[16px] font-semibold rounded-2xl shadow-md active:opacity-90 transition-all flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2"
            >
              去聊这锅
              <span>💬</span>
            </button>
          ) : (
            <button
              onClick={() => setIsJoined(true)}
              className="w-full py-4 bg-[#F5A623] text-white text-[16px] font-semibold rounded-2xl shadow-md active:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              加入这锅
              <span>🥘</span>
            </button>
          )}
        </div>

    </div>
  );
}

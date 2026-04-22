'use client';

// 图12：聊天室活动详情页 — 从图10 右上角 icon 进入
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/common/status-bar';
import { MOCK_ROOM_DETAILS } from '@/lib/mock-rooms';

interface Props {
  roomId: string;
  title: string;
}

export default function RoomDetail({ roomId, title }: Props) {
  const router = useRouter();
  const activity = MOCK_ROOM_DETAILS[roomId];
  const remaining = activity ? activity.maxCount - activity.currentCount : 0;

  return (
    <div className="flex flex-col bg-[#FFF5F7] min-h-full pb-8">

      <StatusBar />

      {/* 导航栏 */}
      <div className="flex items-center justify-between px-4 pb-2 pt-6 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-[17px] font-semibold text-gray-900">{title}</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">活动详情</p>
        </div>
        <div className="w-9 h-9" />
      </div>

      <div className="px-4 space-y-3">

        {/* 基本信息 */}
        {activity && (
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
              <span className="text-[15px] font-bold text-[#FF7A9A]">
                {activity.currentCount}/{activity.maxCount} 人已加入
              </span>
            </div>
          </div>
        )}

        {/* 系统推荐菜 */}
        {activity && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[13px] font-medium text-gray-500 mb-2">🔍 系统推荐菜</p>
            <p className="text-[16px] font-semibold text-gray-900">{activity.recommendedDish}</p>
            <p className="text-[13px] text-gray-500 mt-1">{activity.recommendedReason}</p>
          </div>
        )}

        {/* 参与者 */}
        {activity && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[15px] font-semibold text-gray-900 mb-3">
              👥 参与者（{activity.currentCount}/{activity.maxCount}）
            </p>
            <div className="space-y-3">
              {activity.participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-xl">
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
              {remaining > 0 && (
                <div className="border border-dashed border-gray-200 rounded-xl py-3 text-center">
                  <p className="text-[13px] text-gray-400">
                    还差 {remaining} 人，等待食友加入...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 底部返回聊天 */}
      <div className="px-4 pt-4">
        <button
          onClick={() => router.back()}
          className="w-full py-4 bg-[#FF7A9A] text-white text-[16px] font-semibold rounded-2xl shadow-md active:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          返回聊天
          <span>💬</span>
        </button>
      </div>

    </div>
  );
}

'use client';

// 图10：聊天室 — my_chat 和 chat_list 共用
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatusBar from '@/components/common/status-bar';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  isMe: boolean;
  isSystem?: boolean;
}

const QUICK_REPLIES = [
  '我可以带🥬白菜',
  '几点到合适？',
  '需要带什么调料？',
  '我带饮料🧃',
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    senderId: 'system',
    senderName: '系统',
    senderAvatar: '',
    content: '🎉 活动已成功组锅！周六 15:00 见，地点静安区',
    time: '14:20',
    isMe: false,
    isSystem: true,
  },
  {
    id: '2',
    senderId: 'zhouyu',
    senderName: '周雨',
    senderAvatar: '👩',
    content: '大家好！我已经备好面皮了🥟，谁带白菜？',
    time: '14:32',
    isMe: false,
  },
  {
    id: '3',
    senderId: 'me',
    senderName: '我',
    senderAvatar: '🧑',
    content: '我带白菜和洋葱！',
    time: '14:33',
    isMe: true,
  },
  {
    id: '4',
    senderId: 'chaijiazi',
    senderName: '柴桥子',
    senderAvatar: '👩',
    content: '我带大蒜🧄，顺便带点儿香油',
    time: '14:35',
    isMe: false,
  },
  {
    id: '5',
    senderId: 'system',
    senderName: '系统',
    senderAvatar: '',
    content: '小林 加入了这锅！现在共 4 人，还差 1 人就开锅~',
    time: '14:40',
    isMe: false,
    isSystem: true,
  },
  {
    id: '6',
    senderId: 'xiaolin',
    senderName: '小林',
    senderAvatar: '🧑',
    content: '大家好！第一次参加，期待周六！🙌',
    time: '14:41',
    isMe: false,
  },
];

interface Props {
  roomId: string;
  title: string;
}

export default function ChatRoom({ roomId, title }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        senderId: 'me',
        senderName: '我',
        senderAvatar: '🧑',
        content,
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        isMe: true,
      },
    ]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
  }

  return (
    <div className="flex flex-col flex-1 h-full" style={{ background: 'linear-gradient(to bottom, #FFF5F7 0%, #FDF6F8 50%, #FAFAFA 100%)' }}>

      <StatusBar />

      {/* 顶部导航 */}
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
          <p className="text-[12px] text-gray-500 mt-0.5">4 人 · 周六 15:00</p>
        </div>
        {/* 右上角 icon → 进入图12 活动详情 */}
        <button
          onClick={() => router.push(`/chat/${roomId}/detail?title=${encodeURIComponent(title)}`)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
        </button>
      </div>

      {/* 快捷回复卡片 */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => sendMessage(reply)}
              className="shrink-0 px-3 py-1.5 bg-white rounded-full text-[13px] text-gray-700 border border-gray-100 shadow-sm active:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 min-h-0">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <span className="text-[12px] text-gray-400 bg-black/5 rounded-full px-3 py-1">
                  {msg.content}
                </span>
              </div>
            );
          }

          if (msg.isMe) {
            return (
              <div key={msg.id} className="flex justify-end items-end gap-2">
                <div className="max-w-[65%]">
                  <p className="text-[11px] text-gray-400 text-right mb-1">{msg.time}</p>
                  <div className="bg-[#FF7A9A] text-white rounded-2xl rounded-tr-sm px-4 py-2.5">
                    <p className="text-[14px] leading-relaxed">{msg.content}</p>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center text-lg shrink-0">
                  {msg.senderAvatar}
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="flex items-end gap-2">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-lg shrink-0">
                {msg.senderAvatar}
              </div>
              <div className="max-w-[65%]">
                <p className="text-[11px] text-gray-500 mb-1">{msg.senderName} · {msg.time}</p>
                <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <p className="text-[14px] leading-relaxed text-gray-800">{msg.content}</p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div className="shrink-0 px-4 pt-3 pb-[10px] border-t border-pink-50 bg-transparent">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-white rounded-2xl px-4 py-2.5 shadow-sm min-h-[44px] flex items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="说点什么..."
              className="w-full resize-none text-[14px] text-gray-800 placeholder-gray-400 outline-none leading-relaxed bg-transparent"
              style={{ height: '22px', maxHeight: '96px' }}
              rows={1}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-[#FF7A9A] flex items-center justify-center disabled:opacity-35 active:scale-95 transition-all shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}

import { Sparkles } from 'lucide-react';

type Props = {
  title: string;
  body: React.ReactNode;
  hint?: string;
};

/**
 * 活动详情页里的"局长助理"消息气泡（fake bot）。
 * 视觉上明显区别于真人参与者，避免误导。
 */
export function AgentBubble({ title, body, hint }: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-rose-50 p-4 ring-1 ring-violet-200/50">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500 text-white">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-violet-700">局长助理</p>
            {hint ? (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] text-violet-600">{hint}</span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] font-medium text-neutral-800">{title}</p>
          <div className="mt-2 text-[13px] text-neutral-700">{body}</div>
        </div>
      </div>
    </div>
  );
}

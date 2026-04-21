import { User as UserIcon } from 'lucide-react';
import type { ActivityParticipant } from '@lin-shi/contracts';
import { cn } from '@/lib/cn';

export interface ParticipantRowProps {
  participant: ActivityParticipant;
  isCreator?: boolean;
}

export function ParticipantRow({ participant, isCreator }: ParticipantRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-2 py-2">
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-500',
        )}
        aria-hidden
      >
        {participant.avatarUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={participant.avatarUrl}
            alt={participant.nickname}
            className="h-full w-full object-cover"
          />
        ) : (
          <UserIcon className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-neutral-900">
          {participant.nickname}
        </p>
        <p className="text-[12px] text-neutral-500">
          {isCreator ? '🍳 锅主' : '🥄 参与者'}
        </p>
      </div>
    </div>
  );
}

export function ParticipantPlaceholder({ missing }: { missing: number }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 px-2 py-2 text-neutral-400">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-[18px]">
        ?
      </div>
      <p className="text-[13px]">
        还差 {missing} 人，等待食友加入...
      </p>
    </div>
  );
}

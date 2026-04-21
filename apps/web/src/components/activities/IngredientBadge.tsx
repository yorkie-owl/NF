import { cn } from '@/lib/cn';

export interface IngredientBadgeProps {
  name: string;
  emoji?: string;
  /** If true, renders with muted look + "出走" tag (ingredient leaving fridge). */
  walkOut?: boolean;
  className?: string;
}

export function IngredientBadge({
  name,
  emoji,
  walkOut,
  className,
}: IngredientBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px]',
        walkOut
          ? 'border-neutral-200 bg-neutral-100 text-neutral-500'
          : 'border-accent-peach-400/30 bg-accent-peach-400/20 text-neutral-900',
        className,
      )}
    >
      {emoji ? <span aria-hidden>{emoji}</span> : null}
      <span>{name}</span>
      {walkOut ? (
        <span className="ml-0.5 rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">
          出走
        </span>
      ) : null}
    </span>
  );
}

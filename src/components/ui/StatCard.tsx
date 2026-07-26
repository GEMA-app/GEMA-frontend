import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

type StatCardTone = 'default' | 'accent' | 'danger';

const TONE_ICON_WRAP: Record<StatCardTone, string> = {
  default: 'bg-gema-primary/10 dark:bg-white/10 text-gema-primary dark:text-white',
  accent: 'bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent',
  danger: 'bg-red-500/10 text-red-500',
};

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  loading?: boolean;
  tone?: StatCardTone;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  loading = false,
  tone = 'default',
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gema-primary/10 dark:border-white/10 bg-white dark:bg-gema-surface-dark p-6">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${TONE_ICON_WRAP[tone]}`}
      >
        <Icon size={20} aria-hidden />
      </div>
      <div>
        <div
          className="font-heading font-extrabold text-3xl text-gema-primary dark:text-white tabular-nums"
          aria-busy={loading}
        >
          {loading ? (
            <Loader2
              size={26}
              className="animate-spin text-gema-primary/30 dark:text-white/30"
            />
          ) : (
            value
          )}
        </div>
        <p className="mt-1 text-sm text-gema-primary/60 dark:text-white/50">{label}</p>
      </div>
    </div>
  );
}

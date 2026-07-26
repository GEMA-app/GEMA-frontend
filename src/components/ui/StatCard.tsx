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
    <div className="flex flex-col gap-3 rounded-2xl border border-gema-primary/10 dark:border-white/10 bg-white dark:bg-gema-surface-dark p-4 sm:gap-4 sm:p-6">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${TONE_ICON_WRAP[tone]}`}
      >
        <Icon size={18} aria-hidden className="sm:hidden" />
        <Icon size={20} aria-hidden className="hidden sm:block" />
      </div>
      <div>
        <div
          className="font-heading font-extrabold text-2xl text-gema-primary dark:text-white tabular-nums sm:text-3xl"
          aria-busy={loading}
        >
          {loading ? (
            <Loader2
              size={22}
              className="animate-spin text-gema-primary/30 dark:text-white/30"
            />
          ) : (
            value
          )}
        </div>
        <p className="mt-1 text-xs text-gema-primary/60 dark:text-white/50 sm:text-sm">{label}</p>
      </div>
    </div>
  );
}

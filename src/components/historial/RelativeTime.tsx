import { Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatRelativeTime';

interface RelativeTimeProps {
  fecha: string;
}

export function RelativeTime({ fecha }: RelativeTimeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 whitespace-nowrap">
      <Clock size={14} strokeWidth={2} className="flex-shrink-0" />
      {formatRelativeTime(fecha)}
    </span>
  );
}

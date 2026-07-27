import { Badge } from '@/components/ui/Badge';
import type { ReportePrioridad } from '@/types/reporte';

interface PrioridadBadgeProps {
  prioridad: ReportePrioridad;
}

export function PrioridadBadge({ prioridad }: PrioridadBadgeProps) {
  return <Badge estado={prioridad} />;
}
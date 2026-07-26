import type { ReportePrioridad } from '@/types/reporte';

const PRIORIDAD_STYLES: Record<ReportePrioridad, string> = {
  critica: 'bg-purple-100 text-purple-800 border-purple-200',
  alta: 'bg-red-100 text-red-800 border-red-200',
  media: 'bg-orange-100 text-orange-800 border-orange-200',
  baja: 'bg-blue-100 text-blue-800 border-blue-200',
};

const PRIORIDAD_LABELS: Record<ReportePrioridad, string> = {
  critica: 'CRITICA',
  alta: 'ALTA',
  media: 'MEDIA',
  baja: 'BAJA',
};

interface PrioridadBadgeProps {
  prioridad: ReportePrioridad;
}

export function PrioridadBadge({ prioridad }: PrioridadBadgeProps) {
  const label = PRIORIDAD_LABELS[prioridad];

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] sm:text-xs font-bold tracking-wide ${PRIORIDAD_STYLES[prioridad]}`}
      role="status"
      aria-label={`Prioridad ${label}`}
    >
      {label}
    </span>
  );
}
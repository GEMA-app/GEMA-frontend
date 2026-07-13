import type { ReporteEstado } from '@/types/reporte';

const ESTADO_CONFIG: Record<
  ReporteEstado,
  { label: string; dot: string; text: string }
> = {
  completado: {
    label: 'COMPLETADO',
    dot: 'bg-green-500',
    text: 'text-green-700',
  },
  en_proceso: {
    label: 'EN PROCESO',
    dot: 'bg-orange-500',
    text: 'text-orange-700',
  },
  programado: {
    label: 'PROGRAMADO',
    dot: 'bg-blue-500',
    text: 'text-blue-700',
  },
};

interface EstadoIndicatorProps {
  estado: ReporteEstado;
}

export function EstadoIndicator({ estado }: EstadoIndicatorProps) {
  const config = ESTADO_CONFIG[estado];

  return (
    <span
      className={`inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold ${config.text}`}
      role="status"
      aria-label={`Estado ${config.label}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${config.dot}`}
        aria-hidden
      />
      {config.label}
    </span>
  );
}

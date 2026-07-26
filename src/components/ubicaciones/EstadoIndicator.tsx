export type EstadoUbicacion = 'completado' | 'en_progreso' | 'pendiente';

const ESTADO_STYLES: Record<EstadoUbicacion, { label: string; dotClassName: string }> = {
  completado: {
    label: 'COMPLETADO',
    dotClassName: 'bg-[#2E7D32]',
  },
  en_progreso: {
    label: 'EN PROGRESO',
    dotClassName: 'bg-[#E65100]',
  },
  pendiente: {
    label: 'PENDIENTE',
    dotClassName: 'bg-[#9E9E9E]',
  },
};

interface EstadoIndicatorProps {
  estado: EstadoUbicacion;
}

export function EstadoIndicator({ estado }: EstadoIndicatorProps) {
  const { label, dotClassName } = ESTADO_STYLES[estado];

  return (
    <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
      <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotClassName}`} aria-hidden />
      {label}
    </span>
  );
}


import type { ProcesoUbicacion } from '@/types/ubicacion';

const PROCESO_STYLES: Record<ProcesoUbicacion, { label: string; className: string }> = {
  alta: {
    label: 'ALTA',
    className: 'bg-[#FDE8E8] text-[#C62828] border border-[#EF9A9A]',
  },
  media: {
    label: 'MEDIA',
    className: 'bg-[#FFF3E0] text-[#E65100] border border-[#FFCC80]',
  },
  baja: {
    label: 'BAJA',
    className: 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]',
  },
};

interface ProcesoBadgeProps {
  proceso: ProcesoUbicacion;
}

export function ProcesoBadge({ proceso }: ProcesoBadgeProps) {
  const { label, className } = PROCESO_STYLES[proceso];

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Wrench, XCircle, Ban } from 'lucide-react';

export type EstadoActivo =
  | 'operativo'
  | 'en_mantenimiento'
  | 'fuera_de_servicio'
  | 'dado_de_baja';

interface EstadoConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const ESTADO_CONFIG: Record<EstadoActivo, EstadoConfig> = {
  operativo: {
    label: 'Operativo',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  en_mantenimiento: {
    label: 'En mantenimiento',
    icon: Wrench,
    className:
      'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25',
  },
  fuera_de_servicio: {
    label: 'Fuera de servicio',
    icon: XCircle,
    className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  dado_de_baja: {
    label: 'Dado de baja',
    icon: Ban,
    className:
      'bg-gema-primary/10 text-gema-primary/60 dark:bg-white/10 dark:text-white/50 border-gema-primary/15 dark:border-white/15',
  },
};

interface BadgeProps {
  estado: EstadoActivo;
  /** Overrides the default label for this estado, if needed. */
  label?: string;
  className?: string;
}

export function Badge({ estado, label, className = '' }: BadgeProps) {
  const config = ESTADO_CONFIG[estado];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${config.className} ${className}`}
    >
      <Icon size={12} aria-hidden />
      {label ?? config.label}
    </span>
  );
}

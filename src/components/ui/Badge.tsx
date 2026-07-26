import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Wrench, XCircle, Ban, Clock, PauseCircle } from 'lucide-react';

export type EstadoActivo =
  | 'operativo'
  | 'en_mantenimiento'
  | 'fuera_de_servicio'
  | 'dado_de_baja';

export type EstadoOT =
  | 'abierta'
  | 'en_proceso'
  | 'pausada'
  | 'cerrada'
  | 'cancelada';

export type EstadoBadgeType = EstadoActivo | EstadoOT;

interface EstadoConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const ESTADO_CONFIG: Record<EstadoBadgeType, EstadoConfig> = {
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
  abierta: {
    label: 'Abierta',
    icon: Clock,
    className:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  en_proceso: {
    label: 'En progreso',
    icon: Wrench,
    className:
      'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25',
  },
  pausada: {
    label: 'Pausada',
    icon: PauseCircle,
    className:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
  cerrada: {
    label: 'Cerrada',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  cancelada: {
    label: 'Cancelada',
    icon: XCircle,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
};

interface BadgeProps {
  estado: EstadoBadgeType;
  /** Overrides the default label for this estado, if needed. */
  label?: string;
  className?: string;
}

export function Badge({ estado, label, className = '' }: BadgeProps) {
  const config = ESTADO_CONFIG[estado] ?? {
    label: estado,
    icon: Clock,
    className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };
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

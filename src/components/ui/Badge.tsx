import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Wrench, XCircle, Ban, Clock, PauseCircle, AlertCircle, Building2, Factory, FolderTree, Layers, Box, Package, Users, Shield } from 'lucide-react';

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

export type EstadoRepuesto =
  | 'disponible'
  | 'bajo_minimo'
  | 'sin_stock';

export type TipoUbicacionBadge =
  | 'sede'
  | 'planta'
  | 'area'
  | 'seccion';

export type EstadoProveedor =
  | 'activo'
  | 'inactivo';

export type EstadoReporte =
  | 'pendiente'
  | 'resuelto'
  | 'atendido'
  | 'descartado'
  | 'cancelado';

export type PrioridadReporte =
  | 'alta'
  | 'media'
  | 'baja'
  | 'critica';

export type ModuloBadgeType =
  | 'activos'
  | 'mantenimiento'
  | 'inventario'
  | 'usuarios'
  | 'sistema';

export type EstadoBadgeType =
  | EstadoActivo
  | EstadoOT
  | EstadoRepuesto
  | TipoUbicacionBadge
  | EstadoProveedor
  | EstadoReporte
  | PrioridadReporte
  | ModuloBadgeType;

interface EstadoConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const ESTADO_CONFIG: Record<EstadoBadgeType, EstadoConfig> = {
  disponible: {
    label: 'Disponible',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  bajo_minimo: {
    label: 'Bajo mínimo',
    icon: AlertCircle,
    className:
      'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25',
  },
  sin_stock: {
    label: 'Sin stock',
    icon: XCircle,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
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
    label: 'En proceso',
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
  sede: {
    label: 'Sede',
    icon: Building2,
    className:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  planta: {
    label: 'Planta',
    icon: Factory,
    className:
      'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25',
  },
  area: {
    label: 'Área',
    icon: FolderTree,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  seccion: {
    label: 'Sección',
    icon: Layers,
    className:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
  activo: {
    label: 'Activo',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  inactivo: {
    label: 'Inactivo',
    icon: Ban,
    className:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  },
  resuelto: {
    label: 'Resuelto',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  atendido: {
    label: 'Atendido',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  descartado: {
    label: 'Descartado',
    icon: XCircle,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  alta: {
    label: 'Alta',
    icon: AlertCircle,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  media: {
    label: 'Media',
    icon: Clock,
    className:
      'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25',
  },
  baja: {
    label: 'Baja',
    icon: Clock,
    className:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  critica: {
    label: 'Crítica',
    icon: AlertCircle,
    className:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
  activos: {
    label: 'Activos',
    icon: Box,
    className:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  },
  mantenimiento: {
    label: 'Mantenimiento',
    icon: Wrench,
    className:
      'bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25',
  },
  inventario: {
    label: 'Inventario',
    icon: Package,
    className:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  usuarios: {
    label: 'Usuarios',
    icon: Users,
    className:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  sistema: {
    label: 'Sistema',
    icon: Shield,
    className:
      'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
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

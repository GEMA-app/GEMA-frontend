'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, ChevronDown, Loader2, Shield, CheckCircle2, MinusCircle, XCircle } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { buildPermisosMatrix } from '@/lib/roles';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos-rbac';
import { RolBadge } from '@/components/ui/Badge';
import type { Rol } from '@/types/rol';

const MODULOS_ORDEN: ModuloRBAC[] = [
  MODULOS_RBAC.ACTIVOS,
  MODULOS_RBAC.MANTENIMIENTO,
  MODULOS_RBAC.INVENTARIO,
  MODULOS_RBAC.REPORTES,
  MODULOS_RBAC.ADMINISTRACION,
  MODULOS_RBAC.PREFERENCIAS,
];

const MODULOS_LABELS: Record<ModuloRBAC, string> = {
  activos: 'Activos',
  mantenimiento: 'Mantenimiento',
  inventario: 'Inventario',
  reportes: 'Reportes',
  administracion: 'Administración',
  preferencias: 'Preferencias',
};

const ACCION_LABELS: Record<AccionRBAC, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

type NivelAcceso = 'full' | 'partial' | 'none';

function nivelAcceso(valores: boolean[]): NivelAcceso {
  if (valores.length === 0 || valores.every((v) => !v)) return 'none';
  if (valores.every((v) => v)) return 'full';
  return 'partial';
}

function AccesoIndicador({ nivel }: { nivel: NivelAcceso }) {
  if (nivel === 'full') return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" aria-label="Acceso completo" />;
  if (nivel === 'none') return <XCircle className="h-5 w-5 text-red-500 shrink-0" aria-label="Sin acceso" />;
  return <MinusCircle className="h-5 w-5 text-gray-400 shrink-0" aria-label="Acceso parcial" />;
}

function ModuloRow({ rolId, modulo, matrix, open, onToggle }: {
  rolId: string;
  modulo: ModuloRBAC;
  matrix: Record<string, boolean>;
  open: boolean;
  onToggle: () => void;
}) {
  const valores = ACCIONES_RBAC.map((accion) => matrix[`${modulo}:${accion}`] ?? false);
  const nivel = nivelAcceso(valores);

  return (
    <div className="border-t border-gray-100 dark:border-white/5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer hover:bg-gema-bg-light/60 dark:hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-gema-primary dark:text-white/90">
          {MODULOS_LABELS[modulo]}
        </span>
        <div className="flex items-center gap-3">
          <AccesoIndicador nivel={nivel} />
          <ChevronDown
            className={`h-4 w-4 text-gema-primary/40 dark:text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`${rolId}-${modulo}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 pb-4 pt-1">
              {ACCIONES_RBAC.map((accion) => {
                const activo = matrix[`${modulo}:${accion}`] ?? false;
                return (
                  <div
                    key={accion}
                    className="flex items-center gap-2 rounded-xl bg-gema-bg-light dark:bg-white/5 px-3 py-2"
                  >
                    {activo ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={3} />
                    ) : (
                      <X className="h-4 w-4 text-red-500 shrink-0" strokeWidth={3} />
                    )}
                    <span className="text-xs font-medium text-gema-primary/70 dark:text-white/60">
                      {ACCION_LABELS[accion]}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RolAccordionItem({ rol, openModulos, onToggleModulo }: {
  rol: Rol;
  openModulos: Set<string>;
  onToggleModulo: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const matrix = buildPermisosMatrix(rol.permisos);

  const valoresGlobales = MODULOS_ORDEN.flatMap((modulo) =>
    ACCIONES_RBAC.map((accion) => matrix[`${modulo}:${accion}`] ?? false),
  );
  const nivelGlobal = nivelAcceso(valoresGlobales);

  return (
    <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 mb-3 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 sm:px-6 text-left cursor-pointer hover:bg-gema-bg-light/60 dark:hover:bg-white/5 transition-colors"
      >
        <RolBadge rol={rol.nombre} />
        <div className="flex items-center gap-3">
          <AccesoIndicador nivel={nivelGlobal} />
          <ChevronDown
            className={`h-5 w-5 text-gema-primary/40 dark:text-white/40 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={rol.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {MODULOS_ORDEN.map((modulo) => {
              const key = `${rol.id}:${modulo}`;
              return (
                <ModuloRow
                  key={key}
                  rolId={rol.id}
                  modulo={modulo}
                  matrix={matrix}
                  open={openModulos.has(key)}
                  onToggle={() => onToggleModulo(key)}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RolesPage() {
  const { roles, loading, error, empty } = useRoles();
  const [openModulos, setOpenModulos] = useState<Set<string>>(new Set());

  const toggleModulo = (key: string) => {
    setOpenModulos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
          Roles y permisos
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 font-body">
          Consulta los permisos de cada rol por módulo
        </p>
      </div>

      {error && empty ? (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <Shield className="w-5 h-5 shrink-0" />
          {error}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
        </div>
      ) : empty ? (
        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-10 text-center text-sm text-gema-primary/50 dark:text-white/40">
          No hay roles definidos.
        </div>
      ) : (
        <div>
          {roles.map((rol) => (
            <RolAccordionItem
              key={rol.id}
              rol={rol}
              openModulos={openModulos}
              onToggleModulo={toggleModulo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

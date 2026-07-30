'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Shield,
  Sparkles,
  Pencil,
  Save,
  X,
  Loader2,
  Check,
  ChevronDown,
  CheckCircle2,
  MinusCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { RolBadge } from '@/components/ui/Badge';
import { useRoles } from '@/hooks/useRoles';
import { buildPermisosMatrix } from '@/lib/roles';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos-rbac';
import { hasAnyRole } from '@/lib/auth';
import { getEmpresa, updateEmpresa } from '@/services/empresa';
import type { Empresa } from '@/types/empresa';
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

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

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

export default function ConfiguracionPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted ? hasAnyRole(['administrador']) : false;

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [errorEmpresa, setErrorEmpresa] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', rif: '', email_contacto: '' });

  const { roles, loading: loadingRoles, error: errorRoles, empty: emptyRoles } = useRoles();
  const [openModulos, setOpenModulos] = useState<Set<string>>(new Set());

  const toggleModulo = (key: string) => {
    setOpenModulos((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const loadEmpresa = useCallback(() => {
    setLoadingEmpresa(true);
    getEmpresa()
      .then((e) => {
        setEmpresa(e);
        setForm({ nombre: e.nombre, rif: e.rif ?? '', email_contacto: e.email_contacto ?? '' });
      })
      .catch((err) => setErrorEmpresa(err instanceof Error ? err.message : 'Error al cargar la empresa'))
      .finally(() => setLoadingEmpresa(false));
  }, []);

  useEffect(() => {
    loadEmpresa();
  }, [loadEmpresa]);

  const handleSaveEmpresa = async () => {
    if (!empresa) return;
    setSaving(true);
    setErrorEmpresa(null);
    try {
      const updated = await updateEmpresa({
        nombre: form.nombre,
        rif: form.rif || undefined,
        email_contacto: form.email_contacto || undefined,
        version: empresa.version,
      });
      setEmpresa(updated);
      setForm({ nombre: updated.nombre, rif: updated.rif ?? '', email_contacto: updated.email_contacto ?? '' });
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios';
      if (msg.includes('ERR_STALE_DATA') || msg.includes('409')) {
        setErrorEmpresa('Los datos de la empresa fueron modificados por otro usuario. Por favor recarga la página.');
      } else {
        setErrorEmpresa(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
          Configuración
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
          Empresa, roles y permisos del sistema
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
        <Card padding="lg" className="xl:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
                <Building2 className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <CardTitle>Empresa</CardTitle>
                <CardDescription>Datos generales de la organización</CardDescription>
              </div>
            </div>
            {isAdmin && empresa && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Pencil className="h-4 w-4" strokeWidth={2} />
                Editar
              </button>
            )}
            {editing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    if (empresa) setForm({ nombre: empresa.nombre, rif: empresa.rif ?? '', email_contacto: empresa.email_contacto ?? '' });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEmpresa}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-gema-accent hover:bg-gema-accent/90 px-4 py-2 text-sm font-semibold text-gray-900 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </CardHeader>

          {loadingEmpresa ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
            </div>
          ) : empresa ? (
            <>
              {editing ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-white/50">Nombre</label>
                    <input
                      value={form.nombre}
                      onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-white/50">RIF</label>
                    <input
                      value={form.rif}
                      onChange={(e) => setForm((f) => ({ ...f, rif: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-white/50">Email de contacto</label>
                    <input
                      type="email"
                      value={form.email_contacto}
                      onChange={(e) => setForm((f) => ({ ...f, email_contacto: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 dark:text-white/50">Nombre</dt>
                    <dd className="font-heading font-bold text-gema-primary dark:text-white">{empresa.nombre}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 dark:text-white/50">RIF</dt>
                    <dd className="text-gema-primary/80 dark:text-white/80">{empresa.rif || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 dark:text-white/50">Email de contacto</dt>
                    <dd className="text-gema-primary/80 dark:text-white/80">{empresa.email_contacto || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 dark:text-white/50">Estado</dt>
                    <dd>
                      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                        {empresa.estado}
                      </span>
                    </dd>
                  </div>
                </dl>
              )}

              {errorEmpresa && (
                <div className="mt-4 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {errorEmpresa}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gema-primary/50 dark:text-white/40">No se pudo cargar la empresa.</p>
          )}
        </Card>

        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
                <Sparkles className="h-5 w-5" strokeWidth={2} />
              </div>
              <CardTitle>Plan actual</CardTitle>
            </div>
          </CardHeader>

          {loadingEmpresa ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
            </div>
          ) : empresa ? (
            <div className="rounded-2xl bg-gema-accent/10 border border-gema-accent/25 p-5 text-center">
              <p className="font-heading text-2xl font-extrabold text-gema-accent-dark dark:text-gema-accent">
                {empresa.plan_id || 'Sin plan'}
              </p>
              <p className="mt-2 text-xs text-gema-primary/60 dark:text-white/50">
                {empresa.trial_hasta ? `Trial hasta ${empresa.trial_hasta}` : 'Sin período de prueba activo'}
              </p>
            </div>
          ) : null}
        </Card>

        <Card padding="lg" className="xl:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
                <Shield className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <CardTitle>Roles y permisos</CardTitle>
                <CardDescription>
                  {isAdmin ? 'Consulta los permisos de cada rol por módulo' : 'Solo lectura — contacta a un administrador para editar'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          {errorRoles && emptyRoles ? (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <Shield className="w-5 h-5 shrink-0" />
              {errorRoles}
            </div>
          ) : loadingRoles ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
            </div>
          ) : emptyRoles ? (
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-10 text-center text-sm text-gema-primary/50 dark:text-white/40">
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
        </Card>
      </div>
    </div>
  );
}

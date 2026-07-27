'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Shield, Sparkles, Pencil, Save, X, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { useRoles } from '@/hooks/useRoles';
import { buildPermisosMatrix } from '@/lib/roles';
import { MODULOS_RBAC, ACCIONES_RBAC, type ModuloRBAC, type AccionRBAC } from '@/lib/permisos';
import { hasAnyRole } from '@/lib/auth';
import { getEmpresa, updateEmpresa } from '@/services/empresa';
import type { Empresa } from '@/types/empresa';
import type { Rol } from '@/types/rol';

const MODULOS_LABELS: Record<ModuloRBAC, string> = {
  activos: 'Activos',
  mantenimiento: 'Mantenimiento',
  inventario: 'Inventario',
  reportes: 'Reportes',
  administracion: 'Administración',
  preferencias: 'Preferencias',
};

const ACCIONES_LABELS: Record<AccionRBAC, string> = {
  view: 'Ver',
  create: 'Crear',
  edit: 'Editar',
  delete: 'Eliminar',
};

const inputClass =
  'w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

function RolRow({ rol }: { rol: Rol }) {
  const matrix = buildPermisosMatrix(rol.permisos);
  const modulos = Object.values(MODULOS_RBAC);
  const acciones = [...ACCIONES_RBAC];

  return (
    <tr className="transition-colors hover:bg-gema-bg-light/60 dark:hover:bg-white/5">
      <td className="px-3 py-3 sm:px-4 sm:py-3.5 font-semibold text-gema-primary dark:text-white">
        {rol.nombre}
      </td>
      {modulos.map((modulo) => (
        <td key={modulo} className="px-2 py-3 text-center">
          <div className="flex justify-center gap-1">
            {acciones.map((accion) => {
              const activo = !!matrix[`${modulo}:${accion}`];
              return (
                <span
                  key={accion}
                  title={`${MODULOS_LABELS[modulo]} — ${ACCIONES_LABELS[accion]}`}
                  className={`flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold ${
                    activo
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-white/30'
                  }`}
                >
                  {ACCIONES_LABELS[accion][0]}
                </span>
              );
            })}
          </div>
        </td>
      ))}
    </tr>
  );
}

export default function ConfiguracionPage() {
  const isAdmin = hasAnyRole(['admin']);

  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [errorEmpresa, setErrorEmpresa] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nombre: '', rif: '', email_contacto: '' });

  const { roles, loading: loadingRoles, empty: emptyRoles } = useRoles();
  const modulos = Object.values(MODULOS_RBAC);
  const acciones = [...ACCIONES_RBAC];

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
      setErrorEmpresa(err instanceof Error ? err.message : 'Error al guardar los cambios');
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
                  {isAdmin ? 'Vista de permisos por módulo' : 'Solo lectura — contacta a un administrador para editar'}
                </CardDescription>
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/configuracion/roles"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline cursor-pointer"
              >
                Editar roles
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </CardHeader>

          <div className="overflow-x-auto rounded-2xl border border-gema-primary/10 dark:border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gema-bg-light dark:bg-gema-surface-dark-2 text-left">
                  <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-xs font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50">
                    Rol
                  </th>
                  {modulos.map((m) => (
                    <th
                      key={m}
                      className="px-2 py-2.5 sm:py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50"
                    >
                      {MODULOS_LABELS[m]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gema-primary/5 dark:divide-white/5 bg-white dark:bg-gema-surface-dark">
                {loadingRoles ? (
                  <tr aria-busy="true">
                    <td colSpan={modulos.length + 1} className="px-4 py-10 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-gema-primary/40 dark:text-white/40" />
                    </td>
                  </tr>
                ) : emptyRoles ? (
                  <tr>
                    <td
                      colSpan={modulos.length + 1}
                      className="px-4 py-10 text-center text-sm text-gema-primary/50 dark:text-white/40"
                    >
                      No hay roles definidos.
                    </td>
                  </tr>
                ) : (
                  roles.map((rol) => <RolRow key={rol.id} rol={rol} />)
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, User, Calendar, Pencil, Check, X, Shield } from 'lucide-react';
import { getUsuarioById } from '@/services/usuarios';
import { buildPermisosFromRol, rolSlugFromLabel } from '@/lib/permisos';
import { Badge, RolBadge } from '@/components/ui/Badge';
import type { Usuario, UsuarioPermiso } from '@/types/usuario';

function formatFecha(fecha?: string | null): string {
  if (!fecha) return '—';
  try {
    return new Date(fecha).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fecha;
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 sm:py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gema-primary/5 dark:bg-white/5 text-gema-accent-dark dark:text-gema-accent">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gema-primary/60 dark:text-white/50 mb-0.5">
          {label}
        </p>
        <div className="text-sm font-semibold text-gema-primary dark:text-white">
          {value || '—'}
        </div>
      </div>
    </div>
  );
}

function PermisoRow({ permiso }: { permiso: UsuarioPermiso }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm font-medium text-gema-primary/90 dark:text-white/90">
        {permiso.nombre}
      </span>
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
          permiso.activo
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
        }`}
      >
        {permiso.activo ? (
          <Check size={16} strokeWidth={2.5} />
        ) : (
          <X size={16} strokeWidth={2.5} />
        )}
      </span>
    </li>
  );
}

export default function UsuarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('ID no especificado.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const u = await getUsuarioById(id);
        if (!cancelled) setUsuario(u);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar usuario');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const permisos = usuario
    ? buildPermisosFromRol(rolSlugFromLabel(usuario.roles[0] || ''))
    : [];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-gema-primary/60 dark:text-white/50">
        Cargando detalle del usuario...
      </div>
    );
  }

  if (error || !usuario) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Link
          href="/usuarios"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 hover:text-gema-primary dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a usuarios
        </Link>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 text-red-700 dark:text-red-400">
          {error || 'Usuario no encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <Link
            href="/usuarios"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50 hover:text-gema-primary dark:hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a usuarios
          </Link>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            {usuario.nombre}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Detalle del usuario y permisos asignados
          </p>
        </div>
        <Link
          href={`/usuarios/${usuario.id}/editar`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Pencil className="w-4 h-4" strokeWidth={2} />
          Editar usuario
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
          <h2 className="font-heading font-semibold text-lg text-gema-primary dark:text-white border-b border-gray-100 dark:border-white/5 pb-4 mb-2">
            Información general
          </h2>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            <DetailRow icon={User} label="Nombre" value={usuario.nombre} />
            <DetailRow icon={Mail} label="Correo electrónico" value={usuario.email} />
            <DetailRow icon={Phone} label="Teléfono" value={usuario.telefono || '—'} />
            <DetailRow
              icon={Shield}
              label="Estado"
              value={<Badge estado={usuario.activo ? 'activo' : 'inactivo'} />}
            />
            <DetailRow
              icon={Shield}
              label="Roles asignados"
              value={
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {usuario.roles.length > 0 ? (
                    usuario.roles.map((rol) => <RolBadge key={rol} rol={rol} />)
                  ) : (
                    <span>Sin rol</span>
                  )}
                </div>
              }
            />
            <DetailRow
              icon={Calendar}
              label="Fecha de registro"
              value={formatFecha(usuario.created_at)}
            />
            <DetailRow
              icon={Calendar}
              label="Última actualización"
              value={formatFecha(usuario.updated_at)}
            />
          </div>
        </div>

        {permisos.length > 0 && (
          <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
            <h2 className="font-heading font-semibold text-lg text-gema-primary dark:text-white border-b border-gray-100 dark:border-white/5 pb-4 mb-4">
              Permisos y accesos
            </h2>
            <ul className="divide-y divide-gray-100 dark:divide-white/5">
              {permisos.map((p) => (
                <PermisoRow key={p.id} permiso={p} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

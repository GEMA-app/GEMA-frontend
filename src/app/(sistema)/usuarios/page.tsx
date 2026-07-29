'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, Users, CheckCircle2, Ban, Shield, AlertCircle, Power } from 'lucide-react';
import Swal from 'sweetalert2';
import { useUsuarios } from '@/hooks/useUsuarios';
import { getCurrentUser } from '@/services/auth';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, RolBadge } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import type { Usuario } from '@/types/usuario';

const PER_PAGE = 15;

function formatFecha(fechaStr?: string | null): string {
  if (!fechaStr) return '—';
  try {
    return new Date(fechaStr).toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return fechaStr;
  }
}

export default function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState<'activo' | 'inactivo' | ''>('');
  const [page, setPage] = useState(1);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  const {
    allUsuarios,
    usuarios,
    meta,
    loading,
    error,
    empty,
    actualizarUsuario,
    eliminarUsuario,
  } = useUsuarios({
    search: debouncedSearch,
    estado: estadoFiltro,
    page,
    perPage: PER_PAGE,
  });

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((user) => {
        if (!cancelled) setCurrentUser(user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const isAdmin = useMemo(() => {
    if (!currentUser) return true; // fallback to true if loading auth info
    return currentUser.roles.some((r) => r.toLowerCase().includes('admin'));
  }, [currentUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const summary = useMemo(() => {
    const total = allUsuarios.length;
    const activos = allUsuarios.filter((u) => u.activo).length;
    const inactivos = allUsuarios.filter((u) => !u.activo).length;
    const administradores = allUsuarios.filter((u) =>
      u.roles.some((r) => r.toLowerCase().includes('admin')),
    ).length;
    return { total, activos, inactivos, administradores };
  }, [allUsuarios]);

  const handleToggleActivo = useCallback(
    async (usuario: Usuario) => {
      const accion = usuario.activo ? 'desactivar' : 'activar';
      const confirmEmail = window.prompt(
        `Para ${accion} al usuario "${usuario.nombre}", ingresa su correo electrónico para confirmar:\n${usuario.email}`,
      );
      if (confirmEmail === null) return;
      if (confirmEmail.trim().toLowerCase() !== usuario.email.trim().toLowerCase()) {
        alert('El correo electrónico no coincide. Operación cancelada.');
        return;
      }
      try {
        await actualizarUsuario(usuario.id, { activo: !usuario.activo });
      } catch (err) {
        alert(err instanceof Error ? err.message : `Error al ${accion} el usuario`);
      }
    },
    [actualizarUsuario],
  );

  const handleDelete = useCallback(
    async (id: string, email: string) => {
      const { value } = await Swal.fire({
        title: '¿Eliminar usuario?',
        text: 'Escribe el correo del usuario para confirmar',
        input: 'text',
        inputPlaceholder: 'Ej: usuario@empresa.com',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#EF4444',
        cancelButtonText: 'Cancelar',
      });
      if (value === undefined) return;
      if (value !== email) {
        Swal.fire('Error', 'El correo no coincide', 'error');
        return;
      }
      try {
        await eliminarUsuario(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el usuario');
      }
    },
    [eliminarUsuario],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron usuarios para "${debouncedSearch}".`
    : estadoFiltro
      ? `No hay usuarios con estado "${estadoFiltro}".`
      : 'No hay usuarios registrados. Crea el primero con el botón "Nuevo usuario".';

  const columns: DataTableColumn<Usuario>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (usuario) => (
        <span className="font-semibold text-gema-primary dark:text-white">{usuario.nombre}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (usuario) => (
        <span className="text-gema-primary/80 dark:text-white/80">{usuario.email}</span>
      ),
    },
    {
      key: 'telefono',
      header: 'Teléfono',
      render: (usuario) => usuario.telefono || '—',
    },
    {
      key: 'roles',
      header: 'Roles',
      render: (usuario) => (
        <div className="flex flex-wrap gap-1.5">
          {usuario.roles.length > 0 ? (
            usuario.roles.map((rol) => <RolBadge key={rol} rol={rol} />)
          ) : (
            <span className="text-xs text-gema-primary/40 dark:text-white/40">Sin rol</span>
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (usuario) => <Badge estado={usuario.activo ? 'activo' : 'inactivo'} />,
    },
    {
      key: 'created_at',
      header: 'Fecha creación',
      render: (usuario) => formatFecha(usuario.created_at),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (usuario) => (
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <Link
            href={`/usuarios/${usuario.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver ${usuario.nombre}`}
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link
            href={`/usuarios/${usuario.id}/editar`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Editar ${usuario.nombre}`}
            title="Editar usuario"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          {isAdmin && (
            <button
              type="button"
              onClick={() => handleToggleActivo(usuario)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                usuario.activo
                  ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                  : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
              }`}
              aria-label={`${usuario.activo ? 'Desactivar' : 'Activar'} ${usuario.nombre}`}
              title={usuario.activo ? 'Desactivar usuario (requiere email)' : 'Activar usuario (requiere email)'}
            >
              <Power className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDelete(usuario.id, usuario.email)}
            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label={`Eliminar ${usuario.nombre}`}
            title="Eliminar usuario"
          >
            <Trash className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Usuarios
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Gestión de usuarios y accesos al sistema
          </p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo usuario
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={Users} value={summary.total} label="Total usuarios" loading={loading} tone="default" />
        <StatCard icon={CheckCircle2} value={summary.activos} label="Activos" loading={loading} tone="accent" />
        <StatCard icon={Ban} value={summary.inactivos} label="Inactivos" loading={loading} tone="danger" />
        <StatCard icon={Shield} value={summary.administradores} label="Administradores" loading={loading} tone="accent" />
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o rol..."
            aria-label="Buscar usuarios"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <Select
            value={estadoFiltro}
            onChange={(value) => {
              setEstadoFiltro(value as 'activo' | 'inactivo' | '');
              setPage(1);
            }}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
            aria-label="Filtrar por estado"
            className="sm:w-56"
          />
        </div>

        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={usuarios}
            keyExtractor={(usuario) => usuario.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}

        {!loading && !empty && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gema-primary/70 dark:text-white/60"
            aria-label="Paginación de usuarios"
          >
            <p>
              Página {meta.page} de {meta.lastPage} — {meta.total} usuarios
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark-2 px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.lastPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gema-surface-dark-2 px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, Filter } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useActivos } from '@/hooks/useActivos';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { formatEstadoActivo } from '@/lib/activos';
import type { Activo, ActivoEstado } from '@/types/activo';

function normalizeEstadoDisplay(estado: string): string {
  return formatEstadoActivo(estado);
}

const badgeStyles: Record<string, string> = {
  'Operativo': 'bg-[#E8F5E9] text-[#2E7D32]',
  'En mantenimiento': 'bg-[#FFF3E0] text-[#E65100]',
  'Fuera de servicio': 'bg-[#FCE4EC] text-[#C62828]',
  'Dado de baja': 'bg-gray-100 text-gray-500',
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = badgeStyles[estado] || 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>
      {estado}
    </span>
  );
}

const PER_PAGE = 15;

function ActivosPageContent() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<ActivoEstado | ''>('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');
  const [page, setPage] = useState(1);

  const { activos, meta, loading, error, empty, eliminarActivo } = useActivos({
    search: debouncedSearch,
    estado: filtroEstado || undefined,
    ubicacionId: filtroUbicacion || undefined,
    page,
    perPage: PER_PAGE,
  });

  const { ubicaciones } = useUbicaciones();
  const ubicacionOptions = useMemo(
    () => flattenUbicacionesForSelect(ubicaciones),
    [ubicaciones],
  );

  const ubicacionMap = useMemo(() => {
    const map: Record<string, string> = {};
    const walk = (items: Array<{ id: string; nombre: string; hijos?: unknown[] }>) => {
      for (const item of items) {
        map[item.id] = item.nombre;
        if (Array.isArray(item.hijos)) walk(item.hijos as typeof items);
      }
    };
    if (ubicaciones) walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const activosConUbicacion: Activo[] = useMemo(
    () =>
      activos.map((a) => ({
        ...a,
        ubicacion: ubicacionMap[a.ubicacionId || ''] || a.ubicacion || 'N/A',
      })),
    [activos, ubicacionMap],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      if (!window.confirm(`¿Eliminar el activo "${nombre}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarActivo(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el activo');
      }
    },
    [eliminarActivo],
  );

  const emptyMessage = debouncedSearch || filtroEstado || filtroUbicacion
    ? 'No se encontraron activos para los filtros seleccionados.'
    : 'No hay activos registrados.';

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Activos"
        subtitle="Inventario y seguimiento de equipos críticos"
        variant="activos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar activo..."
        searchLabel="Buscar activos"
        className="mb-8"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Inventario de activos</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por estado */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value as ActivoEstado | '');
                  setPage(1);
                }}
                className="bg-transparent outline-none cursor-pointer"
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                <option value="operativo">Operativo</option>
                <option value="en_mantenimiento">En mantenimiento</option>
                <option value="fuera_de_servicio">Fuera de servicio</option>
                <option value="dado_de_baja">Dado de baja</option>
              </select>
            </div>

            {/* Filtro por ubicación */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700">
              <select
                value={filtroUbicacion}
                onChange={(e) => {
                  setFiltroUbicacion(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent outline-none cursor-pointer max-w-[160px] truncate"
                aria-label="Filtrar por ubicación"
              >
                <option value="">Todas las ubicaciones</option>
                {ubicacionOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón Agregar Activo condicionado por permiso */}
            <PermissionGuard module="activos" action="create">
              <Link
                href="/activos/nuevo"
                className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Agregar activo
              </Link>
            </PermissionGuard>
          </div>
        </div>

        <RequestState
          loading={loading}
          error={empty ? error : null}
          empty={empty}
          loadingMessage="Cargando activos..."
          emptyMessage={emptyMessage}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 accent-[#ECA03C]"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Serial Interno</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Código Activo</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Área / Ubicación</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activosConUbicacion.map((activo) => (
                  <tr key={activo.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-5 pr-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 accent-[#ECA03C]"
                        aria-label={`Seleccionar ${activo.serialInterno}`}
                      />
                    </td>
                    <td className="py-5 pr-6">
                      <p className="font-semibold text-gray-900">{activo.serialInterno}</p>
                    </td>
                    <td className="py-5 pr-6 text-sm text-gray-600 font-mono">
                      {activo.codigoActivo}
                    </td>
                    <td className="py-5 pr-6 text-gray-700">{activo.ubicacion}</td>
                    <td className="py-5 pr-6">
                      <EstadoBadge estado={normalizeEstadoDisplay(activo.estado)} />
                    </td>
                    <td className="py-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/activos/${activo.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Ver ${activo.serialInterno}`}
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        
                        <PermissionGuard module="activos" action="edit">
                          <Link
                            href={`/activos/${activo.id}/editar`}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Editar ${activo.serialInterno}`}
                          >
                            <Pencil className="w-5 h-5" strokeWidth={1.5} />
                          </Link>
                        </PermissionGuard>

                        <PermissionGuard module="activos" action="delete">
                          <button
                            onClick={() => handleDelete(activo.id, activo.serialInterno)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Eliminar ${activo.serialInterno}`}
                          >
                            <Trash className="w-5 h-5" strokeWidth={1.5} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && !empty && meta.lastPage > 1 && (
            <nav
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600"
              aria-label="Paginación de activos"
            >
              <p>
                Página {meta.page} de {meta.lastPage} - {meta.total} activos
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={meta.page >= meta.lastPage}
                  onClick={() => setPage((current) => current + 1)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </nav>
          )}
        </RequestState>
      </div>
    </div>
  );
}

export default function ActivosPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <ActivosPageContent />
    </AuthGuard>
  );
}
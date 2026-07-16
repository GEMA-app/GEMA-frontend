'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useOrdenesTrabajo } from '@/hooks/useOrdenesTrabajo';
import { useUsuariosMap } from '@/hooks/useUsuariosMap';
import { formatEstadoOT, formatTipoMantenimiento } from '@/lib/orden-trabajo';

const badgeStyles: Record<string, string> = {
  Abierta: 'bg-[#E3F2FD] text-[#1565C0]',
  'En progreso': 'bg-[#FFF3E0] text-[#E65100]',
  Pausada: 'bg-[#F3E5F5] text-[#6A1B9A]',
  Cerrada: 'bg-[#E8F5E9] text-[#2E7D32]',
  Cancelada: 'bg-[#FCE4EC] text-[#C62828]',
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = badgeStyles[estado] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>
      {estado}
    </span>
  );
}

const PER_PAGE = 15;

export default function OrdenesTrabajoPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');

  const { ordenes, meta, loading, error, empty, eliminarOrden } = useOrdenesTrabajo({
    search: debouncedSearch || undefined,
    estado: (filtroEstado as never) || undefined,
    page,
    perPage: PER_PAGE,
  });

  const { resolveNombre } = useUsuariosMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, codigo: string) => {
      if (!window.confirm(`¿Eliminar la orden "${codigo}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarOrden(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar la orden');
      }
    },
    [eliminarOrden],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron órdenes para "${debouncedSearch}".`
    : 'No hay órdenes de trabajo registradas.';

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Órdenes de Trabajo"
        subtitle="Gestión de mantenimiento y reparaciones"
        variant="activos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar orden..."
        searchLabel="Buscar órdenes"
        className="mb-8"
      />

      {/* Filtro por estado */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
          className="pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#ECA03C] appearance-none cursor-pointer"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="abierta">Abierta</option>
          <option value="en_proceso">En progreso</option>
          <option value="pausada">Pausada</option>
          <option value="cerrada">Cerrada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Órdenes de trabajo</h2>
          <Link href="/ordenes-trabajo/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nueva orden
          </Link>
        </div>

        <RequestState
          loading={loading}
          error={error}
          empty={empty}
          loadingMessage="Cargando órdenes de trabajo..."
          emptyMessage={emptyMessage}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Orden</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Supervisor</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="border-b border-gray-100 last:border-0">
                    {/* Código + subtítulo de tipo — igual a activos: nombre + serial */}
                    <td className="py-5 pr-6">
                      <p className="font-semibold text-gray-900">{orden.codigo_ot}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatTipoMantenimiento(orden.tipo)}</p>
                    </td>
                    {/* Nombre del supervisor resuelto */}
                    <td className="py-5 pr-6 text-gray-700">
                      {resolveNombre(orden.supervisor_id)}
                    </td>
                    <td className="py-5 pr-6">
                      <EstadoBadge estado={formatEstadoOT(orden.estado)} />
                    </td>
                    <td className="py-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/ordenes-trabajo/${orden.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Ver ${orden.codigo_ot}`}
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <Link
                          href={`/ordenes-trabajo/${orden.id}/editar`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Editar ${orden.codigo_ot}`}
                        >
                          <Pencil className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(orden.id, orden.codigo_ot)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Eliminar ${orden.codigo_ot}`}
                        >
                          <Trash className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && !empty && meta.lastPage > 1 && (
            <nav className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600" aria-label="Paginación">
              <p>Página {meta.page} de {meta.lastPage} — {meta.total} órdenes</p>
              <div className="flex gap-2">
                <button type="button" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Anterior</button>
                <button type="button" disabled={meta.page >= meta.lastPage} onClick={() => setPage(p => p + 1)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Siguiente</button>
              </div>
            </nav>
          )}
        </RequestState>
      </div>
    </div>
  );
}

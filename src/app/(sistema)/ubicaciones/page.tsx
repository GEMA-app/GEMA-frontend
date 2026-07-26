'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, ChevronRight, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { filterUbicaciones, flattenVisibleRows, type FlatUbicacionRow } from '@/lib/ubicaciones';

const tipoStyles: Record<string, string> = {
  sede: 'bg-[#E8EAF6] text-[#283593]',
  planta: 'bg-[#E8F5E9] text-[#2E7D32]',
  area: 'bg-[#FFF3E0] text-[#E65100]',
  seccion: 'bg-[#F3E5F5] text-[#6A1B9A]',
};

function TipoBadge({ tipo }: { tipo: string }) {
  const s = tipoStyles[tipo] || 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s}`}>
      {tipo}
    </span>
  );
}

function UbicacionesPageContent() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const { ubicaciones, loading, error, empty, deleteUbicacion } = useUbicaciones();

  const filtered = useMemo(
    () => (debouncedSearch ? filterUbicaciones(ubicaciones, debouncedSearch) : ubicaciones),
    [ubicaciones, debouncedSearch],
  );

  const autoExpanded = useMemo(() => {
    if (!debouncedSearch) return expandedIds;
    const ids = new Set(expandedIds);
    const walk = (items: typeof ubicaciones) => {
      for (const item of items) {
        if (item.hijos?.length) {
          ids.add(item.id);
          walk(item.hijos);
        }
      }
    };
    walk(filtered);
    return ids;
  }, [debouncedSearch, filtered, expandedIds]);

  const rows = useMemo(
    () => flattenVisibleRows(filtered, autoExpanded),
    [filtered, autoExpanded],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      if (!window.confirm(`¿Eliminar la ubicación "${nombre}"? Esta acción no se puede deshacer.`)) return;
      try {
        await deleteUbicacion(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar la ubicación');
      }
    },
    [deleteUbicacion],
  );

  const showEmpty = empty || (!loading && !error && filtered.length === 0);

  const emptyMessage = debouncedSearch
    ? `No se encontraron ubicaciones para "${debouncedSearch}".`
    : 'No hay ubicaciones registradas.';

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Ubicaciones"
        subtitle="Jerarquía de sedes, plantas, áreas y secciones"
        variant="activos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar ubicación..."
        searchLabel="Buscar ubicaciones"
        className="mb-8"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Árbol de ubicaciones</h2>
          <PermissionGuard module="administracion" action="create">
            <Link href="/ubicaciones/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Agregar ubicación
            </Link>
          </PermissionGuard>
        </div>

        <RequestState
          loading={loading}
          error={showEmpty ? error : null}
          empty={showEmpty}
          loadingMessage="Cargando ubicaciones..."
          emptyMessage={emptyMessage}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-4 w-10"></th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Nombre</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Descripción</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: FlatUbicacionRow) => (
                  <tr key={row.ubicacion.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4">
                      {row.hasChildren ? (
                        <button
                          onClick={() => toggleExpand(row.ubicacion.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          aria-label={autoExpanded.has(row.ubicacion.id) ? 'Colapsar' : 'Expandir'}
                        >
                          {autoExpanded.has(row.ubicacion.id) ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      ) : (
                        <span className="w-6 block" />
                      )}
                    </td>
                    <td className="py-3 pr-6">
                      <p className="font-semibold text-gray-900" style={{ paddingLeft: `${row.depth * 20}px` }}>
                        {row.ubicacion.nombre}
                      </p>
                    </td>
                    <td className="py-3 pr-6">
                      <TipoBadge tipo={row.ubicacion.tipo} />
                    </td>
                    <td className="py-3 pr-6 text-sm text-gray-500">
                      {row.ubicacion.descripcion || '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/ubicaciones/${row.ubicacion.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Ver ${row.ubicacion.nombre}`}
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <PermissionGuard module="administracion" action="edit">
                          <Link
                            href={`/ubicaciones/${row.ubicacion.id}/editar`}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Editar ${row.ubicacion.nombre}`}
                          >
                            <Pencil className="w-5 h-5" strokeWidth={1.5} />
                          </Link>
                        </PermissionGuard>
                        <PermissionGuard module="administracion" action="delete">
                          <button
                            onClick={() => handleDelete(row.ubicacion.id, row.ubicacion.nombre)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label={`Eliminar ${row.ubicacion.nombre}`}
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
        </RequestState>
      </div>
    </div>
  );
}

export default function UbicacionesPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <UbicacionesPageContent />
    </AuthGuard>
  );
}


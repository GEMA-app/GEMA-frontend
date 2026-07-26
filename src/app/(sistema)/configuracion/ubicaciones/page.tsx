'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';
import { LocalSearchInput } from '@/components/ui/LocalSearchInput';
import type { NuevaUbicacionForm } from '@/types/ubicacion';
import { UbicacionesTabs, type UbicacionesVista } from '@/components/ubicaciones/UbicacionesTabs';
import { UbicacionRow } from '@/components/ubicaciones/UbicacionRow';
import { MapaUbicaciones } from '@/components/ubicaciones/MapaUbicaciones';
import { NuevaUbicacionModal } from '@/components/ubicaciones/NuevaUbicacionModal';
import { RequestState } from '@/components/ui/RequestState';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import {
  collectExpandableIds,
  filterUbicaciones,
  flattenVisibleRows,
} from '@/lib/ubicaciones';

function GestionUbicacionesPageContent() {
  const {
    ubicaciones,
    loading,
    error,
    empty,
    isMutating,
    refetch,
    createUbicacion,
    deleteUbicacion,
  } = useUbicaciones();

  const [vista, setVista] = useState<UbicacionesVista>('lista');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasInitializedExpansion, setHasInitializedExpansion] = useState(false);

  useEffect(() => {
    if (!hasInitializedExpansion && ubicaciones.length > 0) {
      setExpandedIds(new Set(collectExpandableIds(ubicaciones)));
      setHasInitializedExpansion(true);
    }
  }, [ubicaciones, hasInitializedExpansion]);

  const filteredUbicaciones = useMemo(
    () => filterUbicaciones(ubicaciones, searchQuery),
    [ubicaciones, searchQuery],
  );

  const visibleRows = useMemo(() => {
    const expandedForSearch = searchQuery.trim()
      ? new Set(collectExpandableIds(filteredUbicaciones))
      : expandedIds;

    return flattenVisibleRows(filteredUbicaciones, expandedForSearch);
  }, [filteredUbicaciones, expandedIds, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateUbicacion = async (data: NuevaUbicacionForm) => {
    await createUbicacion(data);

    if (data.parentId) {
      setExpandedIds((current) => new Set([...current, data.parentId!]));
    }

    setIsModalOpen(false);
  };

  const handleDeleteMapa = useCallback((id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar la ubicación "${nombre}"? Esta acción no se puede deshacer.`)) return;
    deleteUbicacion(id).catch((err) => {
      const msg = err instanceof Error ? err.message : 'Error al eliminar la ubicación';
      alert(msg);
    });
  }, [deleteUbicacion]);

  const showSearchEmpty = !loading && !error && !empty && visibleRows.length === 0;

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <PageHeader
        title="Configuración / Ubicaciones"
        showSearch={false}
      />

      <ConfigBackLink />

      <div className="bg-[#F7F4EF] rounded-[2rem] p-8 shadow-sm border border-[#EBE2D5]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Ubicaciones / Lugares por Mantenimientos
          </h2>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <UbicacionesTabs vista={vista} onChange={setVista} />

          {vista === 'lista' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <LocalSearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar ubicación"
                label="Buscar ubicaciones en la lista"
                className="sm:w-64"
              />
              <PermissionGuard module="administracion" action="create">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={loading || Boolean(error)}
                  className="bg-[#E5A93D] hover:bg-[#d19730] disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm whitespace-nowrap"
                >
                  + Nuevo
                </button>
              </PermissionGuard>
            </div>
          )}
        </div>

        {vista === 'lista' ? (
          <>
            <div className="hidden md:grid bg-[#EED586] rounded-xl px-6 py-3.5 mb-4 grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider items-center shadow-sm">
              <div className="col-span-6">Ubicación (jerarquía)</div>
              <div className="col-span-6">Tipo</div>
            </div>

            <RequestState
              loading={loading}
              error={error}
              empty={empty}
              loadingMessage="Cargando ubicaciones..."
              emptyMessage="No hay ubicaciones registradas."
              onRetry={() => void refetch()}
            >
              <div className="space-y-3">
                {showSearchEmpty ? (
                  <div className="bg-[#EBE2D5] rounded-xl px-6 py-10 text-center text-gray-600 text-sm border border-[#DED4C7]/50">
                    No se encontraron ubicaciones con ese criterio de búsqueda.
                  </div>
                ) : (
                  visibleRows.map(({ ubicacion, depth, hasChildren }) => (
                    <UbicacionRow
                      key={ubicacion.id}
                      ubicacion={ubicacion}
                      depth={depth}
                      hasChildren={hasChildren}
                      isExpanded={expandedIds.has(ubicacion.id)}
                      onToggle={() => toggleExpanded(ubicacion.id)}
                    />
                  ))
                )}
              </div>
            </RequestState>
          </>
        ) : (
          <MapaUbicaciones ubicaciones={ubicaciones} onDelete={handleDeleteMapa} />
        )}
      </div>

      <NuevaUbicacionModal
        isOpen={isModalOpen}
        ubicaciones={ubicaciones}
        isSubmitting={isMutating}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUbicacion}
      />
    </div>
  );
}

export default function GestionUbicacionesPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <GestionUbicacionesPageContent />
    </AuthGuard>
  );
}

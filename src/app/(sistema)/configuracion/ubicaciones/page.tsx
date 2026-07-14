'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';
import { LocalSearchInput } from '@/components/ui/LocalSearchInput';
import type { NuevaUbicacionForm } from '@/types/ubicacion';
import { UbicacionesTabs, type UbicacionesVista } from '@/components/ubicaciones/UbicacionesTabs';
import { UbicacionRow } from '@/components/ubicaciones/UbicacionRow';
import { NuevaUbicacionModal } from '@/components/ubicaciones/NuevaUbicacionModal';
import { RequestState } from '@/components/ui/RequestState';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import {
  collectExpandableIds,
  filterUbicaciones,
  flattenVisibleRows,
} from '@/lib/ubicaciones';

export default function GestionUbicacionesPage() {
  const {
    ubicaciones,
    loading,
    error,
    empty,
    isMutating,
    refetch,
    createUbicacion,
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
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={loading || Boolean(error)}
                className="bg-[#E5A93D] hover:bg-[#d19730] disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm whitespace-nowrap"
              >
                + Nuevo
              </button>
            </div>
          )}
        </div>

        {vista === 'lista' ? (
          <>
            <div className="hidden md:grid bg-[#EED586] rounded-xl px-6 py-3.5 mb-4 grid-cols-12 gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider items-center shadow-sm">
              <div className="col-span-4">Ubicación (jerarquía)</div>
              <div className="col-span-3">Tipo</div>
              <div className="col-span-2">Proceso</div>
              <div className="col-span-3">Estado</div>
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
          <div className="bg-[#EBE2D5] rounded-2xl border border-[#DED4C7]/50 px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EED586] text-[#8B5E3C] mb-4">
              <MapPin size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mapa próximamente</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              La visualización geográfica de ubicaciones estará disponible en una próxima versión.
            </p>
          </div>
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

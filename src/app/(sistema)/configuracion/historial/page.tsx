'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';
import { HistorialEntryRow } from '@/components/historial/HistorialEntryRow';
import { RequestState } from '@/components/ui/RequestState';
import { useHistorial } from '@/hooks/useHistorial';

export default function HistorialUsuariosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const {
    entries,
    loading,
    loadingMore,
    error,
    empty,
    hasMore,
    loadMore,
    refetch,
    meta,
  } = useHistorial({ search: debouncedSearch, limit: 20 });

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      <PageHeader
        title="Configuración / Historial de usuarios"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar"
        searchLabel="Buscar en el historial"
      />

      <ConfigBackLink />

      <div className="bg-[#F7F4EF] rounded-[2rem] p-8 shadow-sm border border-[#EBE2D5]">
        <div className="bg-[#EED586] rounded-xl px-6 py-4 mb-6 shadow-sm">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            Historial de usuarios
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Auditoría y trazabilidad GIMA
          </p>
        </div>

        <RequestState
          loading={loading}
          error={error}
          empty={empty}
          loadingMessage="Cargando historial..."
          emptyMessage="No hay registros de actividad para mostrar."
          onRetry={() => void refetch()}
        >
          <div className="space-y-3">
            {entries.map((entry) => (
              <HistorialEntryRow key={entry.id} entry={entry} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => void loadMore()}
                disabled={loadingMore}
                className="px-5 py-2.5 rounded-xl bg-[#E5A93D] hover:bg-[#d19730] disabled:opacity-60 disabled:cursor-not-allowed text-black text-sm font-semibold transition-colors cursor-pointer"
              >
                {loadingMore ? 'Cargando más...' : 'Cargar más'}
              </button>
            </div>
          )}

          {meta.total > 0 && (
            <p className="mt-4 text-center text-xs text-gray-500">
              Mostrando {entries.length} de {meta.total} registros
            </p>
          )}
        </RequestState>
      </div>
    </div>
  );
}

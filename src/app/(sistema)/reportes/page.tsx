'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { CrearReporteModal } from '@/components/reportes/CrearReporteModal';
import { ReporteFilterTabs } from '@/components/reportes/ReporteFilterTabs';
import { ReportesBackLink } from '@/components/reportes/ReportesBackLink';
import { ReportesList } from '@/components/reportes/ReportesList';
import { ReportesStatCard } from '@/components/reportes/ReportesStatCard';
import { useReportes } from '@/hooks/useReportes';
import type { NuevoReporteInput, ReporteEstado } from '@/types/reporte';

type FiltroEstado = ReporteEstado | 'todos';

export default function ReportesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { reportes, meta, loading, error, empty, crearReporte } = useReportes({
    search: debouncedSearch,
    status: filtroEstado === 'todos' ? undefined : filtroEstado,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const handleCreate = useCallback(
    async (input: NuevoReporteInput) => {
      setSaving(true);
      try {
        await crearReporte(input);
      } finally {
        setSaving(false);
      }
    },
    [crearReporte],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron reportes para "${debouncedSearch}".`
    : filtroEstado !== 'todos'
      ? `No hay reportes con estado "${filtroEstado}".`
      : 'No hay reportes registrados.';

  const pendientes = reportes.filter((r) => r.status === 'pendiente').length;
  const enProceso = reportes.filter((r) => r.status === 'en_proceso').length;
  const atendidos = reportes.filter((r) => r.status === 'atendido').length;

  const activeTabId = `tab-reportes-${filtroEstado}`;

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader
        title="Reportes de Falla"
        subtitle="*Administrador/Supervisor*"
        subtitleClassName="italic"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar"
        searchLabel="Buscar reportes por titulo o ubicacion"
        className="mb-4"
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <ReportesBackLink className="mb-0" />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="bg-[#E5A93D] hover:bg-[#d19730] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm w-full sm:w-auto sm:ml-auto"
        >
          + Crear reporte
        </button>
      </div>

      {error && !empty && (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </div>
      )}

      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        role="region"
        aria-label="Resumen de reportes"
      >
        <ReportesStatCard label="Pendientes" value={pendientes} />
        <ReportesStatCard label="En proceso" value={enProceso} />
        <ReportesStatCard label="Atendidos" value={atendidos} />
      </div>

      <section className="rounded-[2rem] border border-[#EBE2D5] bg-[#F7F4EF] p-5 sm:p-8 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
          Reportes de falla
        </h2>

        <div className="mb-6">
          <ReporteFilterTabs value={filtroEstado} onChange={setFiltroEstado} />
        </div>

        <div
          id="reportes-panel"
          role="tabpanel"
          aria-labelledby={activeTabId}
        >
          <RequestState
            loading={loading}
            error={empty ? error : null}
            empty={empty}
            loadingMessage="Cargando reportes..."
            emptyMessage={emptyMessage}
          >
            <ReportesList reportes={reportes} />
            {meta.lastPage > 1 && (
              <p className="mt-4 text-xs text-gray-500 text-center">
                Pagina {meta.page} de {meta.lastPage} - {meta.total} reportes
              </p>
            )}
          </RequestState>
        </div>
      </section>

      <CrearReporteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />
    </div>
  );
}
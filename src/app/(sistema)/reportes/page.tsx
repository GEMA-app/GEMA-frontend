'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { CrearReporteModal } from '@/components/reportes/CrearReporteModal';
import { ReporteFilterTabs } from '@/components/reportes/ReporteFilterTabs';
import { ReportesBackLink } from '@/components/reportes/ReportesBackLink';
import { ReportesList } from '@/components/reportes/ReportesList';
import { ReportesStatCard } from '@/components/reportes/ReportesStatCard';
import { useReportes } from '@/hooks/useReportes';
import type { ActualizarReporteInput, NuevoReporteInput, Reporte, ReporteEstado } from '@/types/reporte';

type FiltroEstado = ReporteEstado | 'todos';

export default function ReportesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Reporte | null>(null);
  const [saving, setSaving] = useState(false);

  const { reportes, meta, loading, error, empty, crearReporte, editarReporte, eliminarReporte } = useReportes({
    search: debouncedSearch,
    status: filtroEstado === 'todos' ? undefined : filtroEstado,
    page,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // resetear pÃ¡gina al buscar
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Resetear pÃ¡gina al cambiar filtro
  useEffect(() => { setPage(1); }, [filtroEstado]);

  const handleCreate = useCallback(async (input: NuevoReporteInput) => {
    setSaving(true);
    try { await crearReporte(input); } finally { setSaving(false); }
  }, [crearReporte]);

  const handleUpdate = useCallback(async (id: string, input: ActualizarReporteInput) => {
    setSaving(true);
    try { await editarReporte(id, input); setEditTarget(null); } finally { setSaving(false); }
  }, [editarReporte]);

  const handleDelete = useCallback(async (id: string) => {
    try { await eliminarReporte(id); } catch { /* error ya manejado por el hook */ }
  }, [eliminarReporte]);

  const handleTransition = useCallback(async (id: string, status: ReporteEstado, version: number) => {
    await editarReporte(id, { status, version });
  }, [editarReporte]);

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
        <PermissionGuard module="mantenimiento" action="create">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#E5A93D] hover:bg-[#d19730] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm w-full sm:w-auto sm:ml-auto"
          >
            + Crear reporte
          </button>
        </PermissionGuard>
      </div>

      {error && !empty && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8" role="region" aria-label="Resumen de reportes">
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

        <div id="reportes-panel" role="tabpanel" aria-labelledby={activeTabId}>
          <RequestState
            loading={loading}
            error={empty ? error : null}
            empty={empty}
            loadingMessage="Cargando reportes..."
            emptyMessage={emptyMessage}
          >
            <ReportesList
              reportes={reportes}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              onTransition={handleTransition}
            />

            {/* PaginaciÃ³n */}
            {meta.lastPage > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                <button
                  type="button"
                  disabled={meta.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DED4C7] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="text-xs text-gray-500">
                  Pagina {meta.page} de {meta.lastPage} &mdash; {meta.total} reportes
                </span>
                <button
                  type="button"
                  disabled={meta.page >= meta.lastPage}
                  onClick={() => setPage((p) => Math.min(meta.lastPage, p + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DED4C7] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            )}
          </RequestState>
        </div>
      </section>

      {/* Modal crear */}
      <CrearReporteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />

      {/* Modal editar */}
      <CrearReporteModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleCreate}
        onUpdate={handleUpdate}
        saving={saving}
        reporte={editTarget ?? undefined}
      />
    </div>
  );
}

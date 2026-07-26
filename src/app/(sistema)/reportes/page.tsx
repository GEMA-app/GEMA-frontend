'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { getUsuarios } from '@/services/usuarios';
import type { ActualizarReporteInput, NuevoReporteInput, Reporte, ReporteEstado } from '@/types/reporte';
import type { Ubicacion } from '@/types/ubicacion';

type FiltroEstado = ReporteEstado | 'todos';

function flattenUbicaciones(ubs: Ubicacion[]): { id: string; nombre: string }[] {
  return ubs.flatMap((u) => [
    { id: u.id, nombre: u.nombre },
    ...(u.hijos ? flattenUbicaciones(u.hijos) : []),
  ]);
}

export default function ReportesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Reporte | null>(null);
  const [saving, setSaving] = useState(false);
  const [tecnicos, setTecnicos] = useState<{ id: string; nombre: string }[]>([]);

  const { ubicaciones } = useUbicaciones();
  const ubicacionesFlat = useMemo(() => flattenUbicaciones(ubicaciones), [ubicaciones]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { usuarios } = await getUsuarios({ perPage: 200 });
        if (cancelled) return;
        // Mismo mapeo que ROLE_SLUG_MAP en auth.ts
        const roleSlug: Record<string, string> = {
          administrador: 'admin',
          'supervisor de activos': 'supervisor',
          'supervisor de operaciones': 'supervisor',
          'tecnico de mantenimiento': 'tecnico',
          'técnico de mantenimiento': 'tecnico',
          almacenista: 'tecnico',
          reporter: 'reporter',
          'consultor (solo lectura)': 'consultor',
        };
        const extraerRol = (r: unknown): string => {
          if (typeof r === 'string') return r;
          if (r && typeof r === 'object' && 'nombre' in r) return String((r as Record<string, unknown>).nombre);
          return String(r);
        };
        const normalizeR = (r: string) => roleSlug[r.trim().toLowerCase()] || r.trim().toLowerCase();
        const filtrados = usuarios.filter((u) =>
          (u.roles as unknown[]).some((r) => normalizeR(extraerRol(r)) === 'tecnico')
        );
        console.log('[reportes] usuarios total:', usuarios.length, 'tecnicos filtrados:', filtrados.length, 'TODOS los usuarios:', usuarios.map((u) => ({ nombre: u.nombre, roles: u.roles })));
        setTecnicos(filtrados.map((u) => ({ id: u.id, nombre: u.nombre })));
      } catch (err) {
        console.error('[reportes] error al cargar tecnicos:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const { reportes, meta, loading, error, empty, crearReporte, editarReporte, eliminarReporte } = useReportes({
    search: debouncedSearch,
    status: filtroEstado === 'todos' ? undefined : filtroEstado,
    page,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

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
    try { await eliminarReporte(id); } catch { }
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

      <CrearReporteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
        ubicaciones={ubicacionesFlat}
        tecnicos={tecnicos}
      />

      <CrearReporteModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleCreate}
        onUpdate={handleUpdate}
        saving={saving}
        reporte={editTarget ?? undefined}
        ubicaciones={ubicacionesFlat}
        tecnicos={tecnicos}
      />
    </div>
  );
}
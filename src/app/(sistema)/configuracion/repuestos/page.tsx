'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';
import { RequestState } from '@/components/ui/RequestState';
import { EditarRepuestoModal } from '@/components/repuestos/EditarRepuestoModal';
import { NuevoRepuestoModal } from '@/components/repuestos/NuevoRepuestoModal';
import { RepuestosTable } from '@/components/repuestos/RepuestosTable';
import { useRepuestos } from '@/hooks/useRepuestos';
import type { ActualizarRepuestoInput, NuevoRepuestoInput, Repuesto } from '@/types/repuesto';

const PER_PAGE = 15;

export default function RepuestosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [nuevoModalOpen, setNuevoModalOpen] = useState(false);
  const [editando, setEditando] = useState<Repuesto | null>(null);
  const [saving, setSaving] = useState(false);

  const { repuestos, meta, loading, error, empty, crearRepuesto, editarRepuesto, eliminarRepuesto } =
    useRepuestos({
      page,
      perPage: PER_PAGE,
      search: debouncedSearch,
    });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string) => {
      const repuesto = repuestos.find((r) => r.id === id);
      const ref = repuesto?.articuloId ?? 'este repuesto';
      const confirmed = window.confirm(
        `¿Eliminar el repuesto "${ref}"? Esta acción no se puede deshacer.`,
      );
      if (!confirmed) return;
      await eliminarRepuesto(id);
    },
    [eliminarRepuesto, repuestos],
  );

  const handleCreate = useCallback(
    async (input: NuevoRepuestoInput) => {
      setSaving(true);
      try {
        await crearRepuesto(input);
      } finally {
        setSaving(false);
      }
    },
    [crearRepuesto],
  );

  const handleEdit = useCallback(
    async (id: string, input: ActualizarRepuestoInput) => {
      setSaving(true);
      try {
        await editarRepuesto(id, input);
      } finally {
        setSaving(false);
      }
    },
    [editarRepuesto],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron repuestos para "${debouncedSearch}".`
    : 'No hay repuestos registrados.';

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader
        title="Configuración / Repuestos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar repuestos"
        searchLabel="Buscar repuestos"
      />

      <ConfigBackLink />

      <div className="bg-[#F7F4EF] rounded-[2rem] p-6 sm:p-8 shadow-sm border border-[#EBE2D5]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de repuestos</h2>
            <p className="text-gray-500 text-sm mt-1">Control de stock, partes y consumibles</p>
          </div>
          <button
            type="button"
            onClick={() => setNuevoModalOpen(true)}
            className="bg-[#E5A93D] hover:bg-[#d19730] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm w-full sm:w-auto"
          >
            + Nuevo repuesto
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

        <RequestState
          loading={loading}
          error={empty ? error : null}
          empty={empty}
          loadingMessage="Cargando repuestos…"
          emptyMessage={emptyMessage}
        >
          <RepuestosTable
            repuestos={repuestos}
            loading={false}
            error={null}
            empty={false}
            searchQuery=""
            onSearchChange={() => {}}
            onNew={() => setNuevoModalOpen(true)}
            onEdit={setEditando}
            onDelete={handleDelete}
          />
        </RequestState>

        {!loading && !empty && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600"
            aria-label="Paginación de repuestos"
          >
            <p>
              Página {meta.page} de {meta.lastPage} · {meta.total} repuestos
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="rounded-xl border border-[#DED4C7] bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.lastPage}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl border border-[#DED4C7] bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}
      </div>

      <NuevoRepuestoModal
        isOpen={nuevoModalOpen}
        onClose={() => setNuevoModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />

      <EditarRepuestoModal
        isOpen={editando !== null}
        repuesto={editando}
        onClose={() => setEditando(null)}
        onSave={handleEdit}
        saving={saving}
      />
    </div>
  );
}

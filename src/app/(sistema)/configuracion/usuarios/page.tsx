'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfigBackLink } from '@/components/configuracion/ConfigBackLink';
import { RequestState } from '@/components/ui/RequestState';
import { NuevoUsuarioModal } from '@/components/usuarios/NuevoUsuarioModal';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { useUsuarios } from '@/hooks/useUsuarios';
import type { NuevoUsuarioInput } from '@/types/usuario';

const PER_PAGE = 15;

export default function GestionUsuariosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { usuarios, meta, loading, error, empty, crearUsuario, eliminarUsuario } =
    useUsuarios({
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
      const usuario = usuarios.find((item) => item.id === id);
      const nombre = usuario?.nombre ?? 'este usuario';
      const confirmed = window.confirm(
        `¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`,
      );
      if (!confirmed) {
        return;
      }
      await eliminarUsuario(id);
    },
    [eliminarUsuario, usuarios],
  );

  const handleCreate = useCallback(
    async (input: NuevoUsuarioInput) => {
      setSaving(true);
      try {
        await crearUsuario(input);
      } finally {
        setSaving(false);
      }
    },
    [crearUsuario],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron usuarios para "${debouncedSearch}".`
    : 'No hay usuarios registrados.';

  return (
    <div className="flex-1 bg-white p-6 sm:p-8 overflow-y-auto">
      <PageHeader
        title="Configuración / Usuarios"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar usuarios"
        searchLabel="Buscar usuarios"
      />

      <ConfigBackLink />

      <div className="bg-[#F7F4EF] rounded-[2rem] p-6 sm:p-8 shadow-sm border border-[#EBE2D5]">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de usuarios</h2>
            <p className="text-gray-500 text-sm mt-1">Administración de permisos y personal</p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-[#E5A93D] hover:bg-[#d19730] text-black font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer transition-colors text-sm w-full sm:w-auto"
          >
            + Nuevo usuario
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
          loadingMessage="Cargando usuarios…"
          emptyMessage={emptyMessage}
        >
          <UsuariosTable usuarios={usuarios} onDelete={handleDelete} />
        </RequestState>

        {!loading && !empty && meta.lastPage > 1 && (
          <nav
            className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600"
            aria-label="Paginación de usuarios"
          >
            <p>
              Página {meta.page} de {meta.lastPage} · {meta.total} usuarios
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

      <NuevoUsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
        saving={saving}
      />
    </div>
  );
}

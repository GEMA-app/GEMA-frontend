'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useUsuarios } from '@/hooks/useUsuarios';

const PER_PAGE = 15;

function ActivoBadge({ activo }: { activo: boolean }) {
  const s = activo
    ? 'bg-[#E8F5E9] text-[#2E7D32]'
    : 'bg-[#FCE4EC] text-[#C62828]';
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export default function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const { usuarios, total, loading, error, empty, eliminarUsuario } = useUsuarios({
    search: debouncedSearch,
    page,
    perPage: PER_PAGE,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      if (!window.confirm(`¿Eliminar el usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarUsuario(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el usuario');
      }
    },
    [eliminarUsuario],
  );

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));
  const emptyMessage = debouncedSearch
    ? `No se encontraron usuarios para "${debouncedSearch}".`
    : 'No hay usuarios registrados.';

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        variant="activos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar usuario..."
        searchLabel="Buscar usuarios"
        className="mb-8"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Usuarios del sistema</h2>
          <Link href="/usuarios/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Agregar usuario
          </Link>
        </div>

        <RequestState
          loading={loading}
          error={error}
          empty={empty}
          loadingMessage="Cargando usuarios..."
          emptyMessage={emptyMessage}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Nombre</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Email</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Teléfono</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-5 pr-6">
                      <p className="font-semibold text-gray-900">{usuario.nombre}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{usuario.roles.join(', ')}</p>
                    </td>
                    <td className="py-5 pr-6 text-gray-700">{usuario.email}</td>
                    <td className="py-5 pr-6 text-gray-700">{usuario.telefono || '—'}</td>
                    <td className="py-5 pr-6">
                      <ActivoBadge activo={usuario.activo} />
                    </td>
                    <td className="py-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/usuarios/${usuario.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Ver ${usuario.nombre}`}
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <Link
                          href={`/usuarios/${usuario.id}/editar`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Editar ${usuario.nombre}`}
                        >
                          <Pencil className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(usuario.id, usuario.nombre)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Eliminar ${usuario.nombre}`}
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

          {!loading && !empty && lastPage > 1 && (
            <nav className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600" aria-label="Paginación de usuarios">
              <p>Página {page} de {lastPage} — {total} usuarios</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Anterior</button>
                <button type="button" disabled={page >= lastPage} onClick={() => setPage(p => p + 1)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Siguiente</button>
              </div>
            </nav>
          )}
        </RequestState>
      </div>
    </div>
  );
}

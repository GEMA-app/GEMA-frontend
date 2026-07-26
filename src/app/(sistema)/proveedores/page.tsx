'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useProveedores } from '@/hooks/useProveedores';
import type { Proveedor } from '@/types/proveedor';

export default function ProveedoresPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { proveedores, loading, error, empty, eliminarProveedor } = useProveedores({
    search: debouncedSearch,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      if (!window.confirm(`¿Eliminar el proveedor "${name}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarProveedor(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar el proveedor');
      }
    },
    [eliminarProveedor],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron proveedores para "${debouncedSearch}".`
    : 'No hay proveedores registrados.';

  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
        <PageHeader
          title="Proveedores"
          subtitle="Gestión de proveedores y contactos"
          variant="proveedores"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar proveedor..."
          searchLabel="Buscar proveedores"
          className="mb-8"
        />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Listado de proveedores</h2>
            <PermissionGuard module="administracion" action="create">
              <Link href="/proveedores/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Agregar proveedor
              </Link>
            </PermissionGuard>
          </div>

          <RequestState
            loading={loading}
            error={error}
            empty={empty}
            loadingMessage="Cargando proveedores..."
            emptyMessage={emptyMessage}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Proveedor</th>
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">RIF</th>
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Teléfono</th>
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Email</th>
                    <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-5 pr-6">
                        <p className="font-semibold text-gray-900">{p.name}</p>
                        {p.contact && <p className="text-sm text-gray-500 mt-0.5">{p.contact}</p>}
                      </td>
                      <td className="py-5 pr-6 text-gray-700">{p.rif || '—'}</td>
                      <td className="py-5 pr-6 text-gray-700">{p.phone || '—'}</td>
                      <td className="py-5 pr-6 text-gray-700">{p.email || '—'}</td>
                      <td className="py-5">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/proveedores/${p.id}`}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label={`Ver ${p.name}`}
                          >
                            <Eye className="w-5 h-5" strokeWidth={1.5} />
                          </Link>
                          <PermissionGuard module="administracion" action="edit">
                            <Link
                              href={`/proveedores/${p.id}/editar`}
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              aria-label={`Editar ${p.name}`}
                            >
                              <Pencil className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                          </PermissionGuard>
                          <PermissionGuard module="administracion" action="delete">
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              aria-label={`Eliminar ${p.name}`}
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
    </AuthGuard>
  );
}

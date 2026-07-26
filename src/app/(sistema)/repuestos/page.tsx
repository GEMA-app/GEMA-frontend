'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useRepuestos } from '@/hooks/useRepuestos';
import { stockBajo } from '@/lib/repuestos';

const PER_PAGE = 15;

export default function RepuestosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const { repuestos, meta, loading, error, empty, eliminarRepuesto } = useRepuestos({
    page, perPage: PER_PAGE,
  });

  const filtrados = useCallback(() => {
    if (!debouncedSearch) return repuestos;
    const q = debouncedSearch.toLowerCase();
    return repuestos.filter(r =>
      r.articulo_id.toLowerCase().includes(q) ||
      r.ubicacion_almacen.toLowerCase().includes(q) ||
      (r.proveedor_id && r.proveedor_id.toLowerCase().includes(q))
    );
  }, [repuestos, debouncedSearch]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el repuesto "${name}"?`)) return;
    try {
      await eliminarRepuesto(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }, [eliminarRepuesto]);

  const visibles = filtrados();

  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
        <PageHeader
          title="Repuestos"
          subtitle="Control de stock, partes y consumibles"
          variant="configuracion"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar repuesto..."
          searchLabel="Buscar repuestos"
          className="mb-8"
        />

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gestión de repuestos</h2>
            <PermissionGuard module="inventario" action="create">
              <Link href="/repuestos/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Nuevo repuesto
              </Link>
            </PermissionGuard>
          </div>

          <RequestState
            loading={loading}
            error={error}
            empty={empty && !debouncedSearch}
            loadingMessage="Cargando repuestos..."
            emptyMessage={debouncedSearch ? `No se encontraron repuestos para "${debouncedSearch}"` : 'No hay repuestos registrados.'}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Artículo</th>
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Ubicación</th>
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Stock</th>
                    <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Precio</th>
                    <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-5 pr-6">
                        <p className="font-semibold text-gray-900">{r.articulo_id}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{r.proveedor_id || 'Sin proveedor'}</p>
                      </td>
                      <td className="py-5 pr-6 text-gray-700">{r.ubicacion_almacen}</td>
                      <td className="py-5 pr-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          stockBajo(r) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stockBajo(r) ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          {r.stock_actual}
                        </span>
                      </td>
                      <td className="py-5 pr-6 text-gray-900 font-medium">{r.moneda} {r.precio_unitario}</td>
                      <td className="py-5">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/repuestos/${r.id}`} aria-label="Ver"
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                            <Eye className="w-5 h-5" strokeWidth={1.5} />
                          </Link>
                          <PermissionGuard module="inventario" action="edit">
                            <Link href={`/repuestos/${r.id}/editar`} aria-label="Editar"
                              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                              <Pencil className="w-5 h-5" strokeWidth={1.5} />
                            </Link>
                          </PermissionGuard>
                          <PermissionGuard module="inventario" action="delete">
                            <button onClick={() => handleDelete(r.id, r.articulo_id)}
                              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label="Eliminar">
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

            {!loading && !empty && meta.lastPage > 1 && (
              <nav className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600" aria-label="Paginación">
                <p>Página {meta.page} de {meta.lastPage} — {meta.total} repuestos</p>
                <div className="flex gap-2">
                  <button type="button" disabled={meta.page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                    Anterior
                  </button>
                  <button type="button" disabled={meta.page >= meta.lastPage}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">
                    Siguiente
                  </button>
                </div>
              </nav>
            )}
          </RequestState>
        </div>
      </div>
    </AuthGuard>
  );
}
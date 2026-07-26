'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, Package } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { getArticulos, deleteArticulo } from '@/services/catalogo';
import type { ArticuloCatalogo } from '@/services/catalogo';

const PER_PAGE = 15;

export default function CatalogoPage() {
  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchArticulos = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await getArticulos({ search: debouncedSearch, page, perPage: PER_PAGE });
      setArticulos(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar catálogo.');
    } finally { setLoading(false); }
  }, [debouncedSearch, page]);

  useEffect(() => { void fetchArticulos(); }, [fetchArticulos]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try { await deleteArticulo(id); await fetchArticulos(); }
    catch { alert('No se pudo eliminar. El artículo puede tener activos asociados.'); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Catálogo de Artículos" variant="activos"
        searchPlaceholder="Buscar por nombre..." searchLabel="Buscar"
        searchValue={search} onSearchChange={setSearch}
        className="mb-6"
      />

      <div className="flex justify-end mb-6">
        <Link href="/catalogo/nuevo"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo artículo
        </Link>
      </div>

      <RequestState loading={loading} error={error} empty={!loading && !error && articulos.length === 0}
        loadingMessage="Cargando catálogo..." emptyMessage="No hay artículos en el catálogo."
      >
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                  <th className="text-left py-3 px-4">Nombre</th>
                  <th className="text-left py-3 px-4">Fabricante</th>
                  <th className="text-left py-3 px-4">Modelo</th>
                  <th className="text-left py-3 px-4">U/M</th>
                  <th className="text-right py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {articulos.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{a.name}</td>
                    <td className="py-3 px-4 text-gray-600">{a.manufacturer || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{a.model || '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{a.unit_of_measure || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/catalogo/${a.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Eye className="w-4 h-4 text-gray-500" /></Link>
                        <Link href={`/catalogo/${a.id}/editar`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Pencil className="w-4 h-4 text-gray-500" /></Link>
                        <button type="button" onClick={() => handleDelete(a.id, a.name)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"><Trash className="w-4 h-4 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </RequestState>
    </div>
  );
}

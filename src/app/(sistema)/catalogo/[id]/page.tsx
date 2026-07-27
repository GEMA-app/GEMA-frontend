'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Package } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { getArticulo, getCategorias } from '@/services/catalogo';
import type { ArticuloCatalogo } from '@/services/catalogo';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export default function ArticuloDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [articulo, setArticulo] = useState<ArticuloCatalogo | null>(null);
  const [categoriaNombre, setCategoriaNombre] = useState<string>('—');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getArticulo(id), getCategorias()])
      .then(([a, cats]) => {
        setArticulo(a);
        if (a.category_id) {
          const match = cats.find((c) => c.id === a.category_id);
          if (match) setCategoriaNombre(match.name);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar el artículo.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Catálogo / Detalle de artículo" variant="activos" />

      <div className="mb-6">
        <Link
          href="/catalogo"
          className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !articulo}
        loadingMessage="Cargando artículo..."
        emptyMessage="Artículo no encontrado."
      >
        <div
          className="rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl"
          style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}
        >
          <div className="flex justify-between items-start border-b-2 border-[#2E4365]/20 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#E59D12]" />
              <h2 className="text-2xl font-bold text-gray-900">{articulo?.name}</h2>
            </div>
            {articulo && (
              <PermissionGuard module="administracion" action="edit">
                <Link
                  href={`/catalogo/${articulo.id}/editar`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all cursor-pointer"
                >
                  <Pencil className="w-4 h-4" strokeWidth={2} /> Editar
                </Link>
              </PermissionGuard>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
            <div>
              <p className="text-xs text-gray-500 mb-1">ID</p>
              <p className="font-semibold break-all">{articulo?.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Nombre</p>
              <p className="font-semibold">{articulo?.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Categoría</p>
              <p className="font-semibold">{categoriaNombre}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fabricante</p>
              <p className="font-semibold">{articulo?.manufacturer || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Modelo</p>
              <p className="font-semibold">{articulo?.model || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Unidad de medida</p>
              <p className="font-semibold">{articulo?.unit_of_measure || '—'}</p>
            </div>
          </div>
          {articulo?.description && (
            <div className="mt-6">
              <p className="text-xs text-gray-500 mb-1">Descripción</p>
              <p className="text-sm text-gray-700">{articulo.description}</p>
            </div>
          )}
        </div>
      </RequestState>
    </div>
  );
}

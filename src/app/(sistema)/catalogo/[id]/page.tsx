'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
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

  const labelClass = 'text-xs text-gema-primary/50 dark:text-white/40 mb-1';
  const valueClass = 'font-semibold text-gema-primary dark:text-white';

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !articulo}
        loadingMessage="Cargando artículo..."
        emptyMessage="Artículo no encontrado."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gema-accent/15 text-gema-accent-dark dark:text-gema-accent">
              <Package className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
                {articulo?.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
                Detalle de artículo de catálogo
              </p>
            </div>
          </div>
          {articulo && (
            <PermissionGuard module="administracion" action="edit">
              <Link
                href={`/catalogo/${articulo.id}/editar`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
              >
                <Pencil className="w-4 h-4" strokeWidth={2} />
                Editar
              </Link>
            </PermissionGuard>
          )}
        </div>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Información general</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className={labelClass}>Nombre</p>
              <p className={valueClass}>{articulo?.name}</p>
            </div>
            <div>
              <p className={labelClass}>Categoría</p>
              <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-gema-accent/10 text-gema-accent-dark dark:text-gema-accent border-gema-accent/25">
                {categoriaNombre}
              </span>
            </div>
            <div>
              <p className={labelClass}>Fabricante</p>
              <p className={valueClass}>{articulo?.manufacturer || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>Modelo</p>
              <p className={valueClass}>{articulo?.model || '—'}</p>
            </div>
            <div>
              <p className={labelClass}>Unidad de medida</p>
              <p className={valueClass}>{articulo?.unit_of_measure || '—'}</p>
            </div>
          </div>
          {articulo?.description && (
            <div className="mt-6">
              <p className={labelClass}>Descripción</p>
              <p className="text-sm text-gema-primary/80 dark:text-white/80">{articulo.description}</p>
            </div>
          )}
        </Card>
      </RequestState>
    </div>
  );
}

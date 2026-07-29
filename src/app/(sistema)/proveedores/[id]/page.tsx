'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Pencil, Truck, Mail, Phone, UserCheck, Calendar, Package, AlertCircle, Eye } from 'lucide-react';
import { getProveedor } from '@/services/proveedores';
import { getRepuestos } from '@/services/repuestos';
import { getArticulos } from '@/services/catalogo';
import { Badge, type EstadoRepuesto } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import type { ProveedorDetalle } from '@/types/proveedor';
import type { Repuesto } from '@/types/repuesto';

interface RepuestoEnriquecido extends Repuesto {
  nombreArticulo: string;
  estadoRepuesto: EstadoRepuesto;
}

export default function ProveedorDetallePage() {
  const params = useParams();
  const proveedorId = params.id as string;

  const [supplier, setSupplier] = useState<ProveedorDetalle | null>(null);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [articuloMap, setArticuloMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingRepuestos, setLoadingRepuestos] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proveedorId) {
      setLoading(false);
      setError('ID de proveedor no especificado.');
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        const data = await getProveedor(proveedorId);
        if (!cancelled) setSupplier(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar proveedor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadRepuestosYArticulos() {
      try {
        setLoadingRepuestos(true);
        const [repuestosRes, articulos] = await Promise.all([
          getRepuestos({ proveedorId, perPage: 100 }),
          getArticulos({ perPage: 200 }).catch(() => []),
        ]);

        if (cancelled) return;

        const map = Object.fromEntries(articulos.map((a) => [a.id, a.name]));
        setArticuloMap(map);
        setRepuestos(repuestosRes.repuestos);
      } catch {
        // Non-critical if repuestos fails
      } finally {
        if (!cancelled) setLoadingRepuestos(false);
      }
    }

    loadData();
    loadRepuestosYArticulos();

    return () => {
      cancelled = true;
    };
  }, [proveedorId]);

  const repuestosEnriquecidos: RepuestoEnriquecido[] = useMemo(() => {
    return repuestos.map((r) => {
      let estadoRepuesto: EstadoRepuesto = 'disponible';
      if (r.stock_actual === 0) {
        estadoRepuesto = 'sin_stock';
      } else if (r.stock_actual <= r.stock_minimo) {
        estadoRepuesto = 'bajo_minimo';
      }

      return {
        ...r,
        nombreArticulo: articuloMap[r.articulo_id] || `Artículo (${r.articulo_id.slice(0, 8)})`,
        estadoRepuesto,
      };
    });
  }, [repuestos, articuloMap]);

  const repuestosColumns: DataTableColumn<RepuestoEnriquecido>[] = [
    {
      key: 'articulo',
      header: 'Artículo',
      render: (r) => (
        <span className="font-semibold text-gema-primary dark:text-white">{r.nombreArticulo}</span>
      ),
    },
    {
      key: 'ubicacion',
      header: 'Almacén / Ubicación',
      render: (r) => r.ubicacion_almacen || '—',
    },
    {
      key: 'stock',
      header: 'Stock / Mínimo',
      render: (r) => (
        <span>
          <span className="font-bold">{r.stock_actual}</span>{' '}
          <span className="text-xs text-gema-primary/50 dark:text-white/40">
            (Mín: {r.stock_minimo})
          </span>
        </span>
      ),
    },
    {
      key: 'precio',
      header: 'Precio Unitario',
      render: (r) =>
        r.precio_unitario != null
          ? `${r.precio_unitario.toLocaleString('es-VE')} ${r.moneda ?? 'USD'}`
          : '—',
    },
    {
      key: 'estado',
      header: 'Estado Stock',
      render: (r) => <Badge estado={r.estadoRepuesto} />,
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (r) => (
        <Link
          href={`/inventario/${r.id}`}
          className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer inline-flex"
          title="Ver en inventario"
          aria-label={`Ver repuesto ${r.nombreArticulo}`}
        >
          <Eye className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-gema-primary/60 dark:text-white/50">Cargando datos del proveedor...</p>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="max-w-4xl space-y-6">
        <Link
          href="/proveedores"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gema-primary/70 dark:text-white/70 hover:text-gema-primary dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Proveedores
        </Link>
        <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error || 'Proveedor no encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/proveedores"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gema-primary/70 dark:text-white/70 hover:text-gema-primary dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Proveedores
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
              {supplier.name}
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            RIF: {supplier.rif || 'Sin RIF especificado'}
          </p>
        </div>

        <Link
          href={`/proveedores/${supplier.id}/editar`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Pencil className="w-4 h-4" strokeWidth={2} />
          Editar Proveedor
        </Link>
      </div>

      {/* Tarjeta de Información General */}
      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
        <h2 className="text-base font-semibold text-gema-primary dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
          <Truck className="w-5 h-5 text-gema-accent" />
          Información del Proveedor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gema-primary/5 dark:bg-white/5 text-gema-primary dark:text-white">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 font-medium">RIF / NIT</p>
              <p className="font-semibold text-gema-primary dark:text-white mt-0.5">{supplier.rif || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gema-primary/5 dark:bg-white/5 text-gema-primary dark:text-white">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 font-medium">Persona de Contacto</p>
              <p className="font-semibold text-gema-primary dark:text-white mt-0.5">{supplier.contact || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gema-primary/5 dark:bg-white/5 text-gema-primary dark:text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 font-medium">Correo Electrónico</p>
              <p className="font-semibold text-gema-primary dark:text-white mt-0.5">{supplier.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gema-primary/5 dark:bg-white/5 text-gema-primary dark:text-white">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 font-medium">Teléfono</p>
              <p className="font-semibold text-gema-primary dark:text-white mt-0.5">{supplier.phone || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gema-primary/5 dark:bg-white/5 text-gema-primary dark:text-white">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gema-primary/50 dark:text-white/40 font-medium">Fecha de Registro</p>
              <p className="font-semibold text-gema-primary dark:text-white mt-0.5">
                {supplier.created_at ? new Date(supplier.created_at).toLocaleDateString('es-VE') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Repuestos Suministrados */}
      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
          <h2 className="text-base font-semibold text-gema-primary dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-gema-accent" />
            Repuestos que Suministra
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gema-primary/10 dark:bg-white/10 text-gema-primary dark:text-white">
              {repuestos.length} repuestos
            </span>
            <Link
              href={`/inventario?proveedorId=${supplier.id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-gema-accent/10 hover:bg-gema-accent/20 text-gema-primary dark:text-white transition-colors"
            >
              Ver en Inventario
            </Link>
          </div>
        </div>

        <DataTable
          columns={repuestosColumns}
          data={repuestosEnriquecidos}
          keyExtractor={(r) => r.id}
          loading={loadingRepuestos}
          emptyMessage="Este proveedor no tiene repuestos registrados en el inventario actualmente."
        />
      </div>
    </div>
  );
}

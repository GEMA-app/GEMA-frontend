'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { getProveedor } from '@/services/proveedores';
import type { ProveedorDetalle } from '@/types/proveedor';

function ProveedorDetalleContent() {
  const { id: proveedorId } = useParams<{ id: string }>();

  const [supplier, setSupplier] = useState<ProveedorDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proveedorId) { setLoading(false); setError('ID de proveedor no especificado.'); return; }
    let cancelled = false;
    (async () => {
      try {
        const s = await getProveedor(proveedorId);
        if (!cancelled) setSupplier(s);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar proveedor');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [proveedorId]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('es-VE', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader
        title="Proveedores / Ficha de proveedor"
        variant="proveedores"
      />

      <div className="mb-6">
        <Link href="/proveedores" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !supplier}
        loadingMessage="Cargando proveedor..."
        emptyMessage="Proveedor no encontrado."
      >
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{supplier?.name || 'Sin nombre'}</h2>
              </div>
              {supplier && (
                <PermissionGuard module="administracion" action="edit">
                  <Link
                    href={`/proveedores/${supplier.id}/editar`}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={2} />
                    Editar
                  </Link>
                </PermissionGuard>
              )}
            </div>

            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                <FileText className="w-4 h-4 text-[#E5920C]" />
                Información del Proveedor
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div><p className="text-xs text-gray-500 mb-1">RIF</p><p className="font-semibold">{supplier?.rif || '—'}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Teléfono</p><p className="font-semibold">{supplier?.phone || '—'}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Email</p><p className="font-semibold">{supplier?.email || '—'}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Persona de Contacto</p><p className="font-semibold">{supplier?.contact || '—'}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Creado</p><p className="font-semibold">{formatDate(supplier?.created_at ?? null)}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Actualizado</p><p className="font-semibold">{formatDate(supplier?.updated_at ?? null)}</p></div>
              </div>
            </div>
          </div>
        </div>
      </RequestState>
    </div>
  );
}

export default function ProveedorDetallePage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <ProveedorDetalleContent />
    </AuthGuard>
  );
}

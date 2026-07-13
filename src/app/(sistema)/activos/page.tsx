'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { deleteActivo } from '@/services/activos';

function normalizeEstadoDisplay(estado: string): string {
  const map: Record<string, string> = {
    'operativo': 'Operativo',
    'en_mantenimiento': 'En mantenimiento',
    'fuera_de_servicio': 'Fuera de servicio',
    'dado_de_baja': 'Dado de baja',
  };
  return map[estado] || estado;
}

interface Activo {
  id: string;
  nombre: string;
  serial: string;
  ubicacion: string;
  estado: string;
}

const badgeStyles: Record<string, string> = {
  'Operativo': 'bg-[#E8F5E9] text-[#2E7D32]',
  'En mantenimiento': 'bg-[#FFF3E0] text-[#E65100]',
  'Fuera de servicio': 'bg-[#FCE4EC] text-[#C62828]',
  'Dado de baja': 'bg-gray-100 text-gray-500',
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = badgeStyles[estado] || 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>
      {estado}
    </span>
  );
}

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { ubicaciones } = useUbicaciones();

  const ubicacionMap = useMemo(() => {
    const map: Record<string, string> = {};
    const walk = (items: any[]) => {
      for (const item of items) {
        map[item.id] = item.nombre;
        if (item.hijos) walk(item.hijos);
      }
    };
    if (ubicaciones) walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const handleDelete = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar el activo "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteActivo(id);
      setActivos(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el activo');
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const empresaId = await requireEmpresaId();
        const result = await fetchWithAuth<{ data: Array<{ id: string; attributes: Record<string, unknown> }> }>(
          `/v1/empresas/${empresaId}/activos?limit=100`,
        );
        if (cancelled) return;
        const mapped = (result.data || []).map((item) => {
          const attrs = item.attributes || {};
          const ubiId = attrs.ubicacion_id as string | undefined;
          return {
            id: item.id,
            nombre: (attrs.serial_interno as string) || 'Sin nombre',
            serial: (attrs.codigo_activo as string) || 'N/A',
            ubicacion: (ubiId && ubicacionMap[ubiId]) || ubiId || 'N/A',
            estado: normalizeEstadoDisplay(attrs.estado as string),
          };
        });
        setActivos(mapped);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar activos');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [router, ubicacionMap]);

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Activos"
        subtitle="Inventario y seguimiento de equipos críticos"
        variant="activos"
        searchPlaceholder="Buscar activo..."
        searchLabel="Buscar activos"
        className="mb-8"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Inventario de activos</h2>
          <Link href="/activos/registrar_nuevo_activo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Agregar activo
          </Link>
        </div>

        <RequestState
          loading={loading}
          error={error}
          empty={!loading && !error && activos.length === 0}
          loadingMessage="Cargando activos..."
          emptyMessage="No hay activos registrados."
          onRetry={() => { setLoading(true); setError(null); setActivos([]); }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-4 w-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 accent-[#ECA03C]"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Activo</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Área/ubicación</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((activo) => (
                  <tr key={activo.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-5 pr-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 accent-[#ECA03C]"
                        aria-label={`Seleccionar ${activo.nombre}`}
                      />
                    </td>
                    <td className="py-5 pr-6">
                      <p className="font-semibold text-gray-900">{activo.nombre}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{activo.serial}</p>
                    </td>
                    <td className="py-5 pr-6 text-gray-700">{activo.ubicacion}</td>
                    <td className="py-5 pr-6">
                      <EstadoBadge estado={activo.estado} />
                    </td>
                    <td className="py-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/activos/ficha_de_activo?id=${activo.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Ver ${activo.nombre}`}
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <Link
                          href={`/activos/editar/${activo.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Editar ${activo.nombre}`}
                        >
                          <Pencil className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(activo.id, activo.nombre)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Eliminar ${activo.nombre}`}
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
        </RequestState>
      </div>
    </div>
  );
}

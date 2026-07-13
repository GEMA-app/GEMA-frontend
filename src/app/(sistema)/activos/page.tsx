'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Eye, Wrench, Trash } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';

type Estado = 'Operativo' | 'En mantenimiento';

interface Activo {
  id: string;
  nombre: string;
  serial: string;
  ubicacion: string;
  criticidad: 'Alta' | 'Media' | 'Baja';
  estado: Estado;
}



function EstadoBadge({ estado }: { estado: Estado }) {
  const styles =
    estado === 'Operativo'
      ? 'bg-[#E8F5E9] text-[#2E7D32]'
      : 'bg-[#FFF3E0] text-[#E65100]';

  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${styles}`}>
      {estado}
    </span>
  );
}

export default function ActivosPage() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const empresaId = localStorage.getItem('empresa_id');

    if (!token) {
      router.push('/login');
      return;
    }

    if (empresaId) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/empresas/${empresaId}/activos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.api+json'
        }
      })
        .then(res => res.json())
        .then(result => {
          if (result && result.data) {
            const mappedActivos = result.data.map((item: any) => ({
              id: item.id || '',
              nombre: item.attributes?.nombre || 'Sin nombre',
              serial: item.attributes?.serial || item.attributes?.codigo || 'N/A',
              ubicacion: item.attributes?.ubicacion || 'N/A',
              criticidad: item.attributes?.criticidad || 'Media',
              estado: item.attributes?.estado || 'Operativo',
            }));
            setActivos(mappedActivos);
          }
        })
        .catch(error => {
          console.error('Error fetching activos:', error);
        });
    }
  }, [router]);

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
                <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Criticidad</th>
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
                  <td className="py-5 pr-6 text-gray-700">{activo.criticidad}</td>
                  <td className="py-5 pr-6">
                    <EstadoBadge estado={activo.estado} />
                  </td>
                  <td className="py-5">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href="/activos/ficha_de_activo"
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Ver ${activo.nombre}`}
                      >
                        <Eye className="w-5 h-5" strokeWidth={1.5} />
                      </Link>
                      <button
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Mantenimiento de ${activo.nombre}`}
                      >
                        <Wrench className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        className="p-2 bg-gray-100 text-[#E63946] hover:bg-[#FCE8EA] rounded-xl transition-colors"
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
      </div>
    </div>
  );
}

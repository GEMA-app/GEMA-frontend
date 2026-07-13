'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, Plus, Eye, Wrench, Trash } from 'lucide-react';


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
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Gestión de activos</h1>
          <p className="text-gray-500 text-sm">
            Inventario y seguimiento de equipos críticos
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar activo..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-[#ECA03C] outline-none"
            />
          </div>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <Bell className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <User className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Inventario de activos</h2>
          <button className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Agregar activo
          </button>
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
                      <button
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Ver ${activo.nombre}`}
                      >
                        <Eye className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Mantenimiento de ${activo.nombre}`}
                      >
                        <Wrench className="w-5 h-5" strokeWidth={1.5} />
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

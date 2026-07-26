'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { usePlanesMantenimiento } from '@/hooks/usePlanesMantenimiento';
import { useActivos } from '@/hooks/useActivos';
import type { TipoMantenimiento } from '@/types/plan-mantenimiento';

const TIPO_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'correctivo', label: 'Correctivo' },
  { value: 'predictivo', label: 'Predictivo' },
];

const TIPO_STYLES: Record<string, string> = {
  preventivo: 'bg-[#E3F2FD] text-[#1565C0]',
  correctivo: 'bg-[#FFF3E0] text-[#E65100]',
  predictivo: 'bg-[#F3E5F5] text-[#7B1FA2]',
};

const PER_PAGE = 15;

import { AuthGuard } from '@/components/auth/AuthGuard';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function PlanesPageContent() {
  const [page, setPage] = useState(1);
  const [filtroActivoId, setFiltroActivoId] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSoloActivos, setFiltroSoloActivos] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const { planes, meta, loading, error, empty, eliminarPlan } = usePlanesMantenimiento({
    page, perPage: PER_PAGE,
    activo_id: filtroActivoId || undefined,
    tipo: (filtroTipo as TipoMantenimiento) || undefined,
    activo: filtroSoloActivos || undefined,
  });

  const { activos } = useActivos({ search: busqueda });
  const activoMap = new Map(activos.map(a => [a.id, a.nombre]));

  const handleDelete = useCallback(async (id: string, nombre: string) => {
    if (!window.confirm(`¿Eliminar el plan "${nombre}"?`)) return;
    try { await eliminarPlan(id); } catch { alert('Error al eliminar el plan.'); }
  }, [eliminarPlan]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white p-8 w-full font-sans">
      <PageHeader title="Planes de mantenimiento" />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#E59D12]">
            {TIPO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={filtroSoloActivos} onChange={e => { setFiltroSoloActivos(e.target.checked); setPage(1); }}
              className="accent-[#E59D12]" />
            Solo activos
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar activo..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-[#E59D12] w-48" />
          </div>
        </div>
        <PermissionGuard module="mantenimiento" action="create">
          <Link href="/mantenimiento/planes/nuevo"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E59D12] text-black font-bold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo plan
          </Link>
        </PermissionGuard>
      </div>

      <RequestState loading={loading} error={error} empty={empty}
        loadingMessage="Cargando planes..." emptyMessage="No hay planes de mantenimiento."
      >
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-beige-gema/35 text-gray-700 uppercase tracking-wider text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold">Activo</th>
                <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                <th className="text-center px-4 py-3 font-semibold">Intervalo (días)</th>
                <th className="text-center px-4 py-3 font-semibold">Próxima ejecución</th>
                <th className="text-center px-4 py-3 font-semibold">Vigente</th>
                <th className="text-center px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {planes.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{activoMap.get(p.activo_id) || p.activo_id}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${TIPO_STYLES[p.tipo] || ''}`}>
                      {p.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{p.intervalo_dias}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{p.proxima_ejecucion}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.activo ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <PermissionGuard module="mantenimiento" action="edit">
                        <Link href={`/mantenimiento/planes/${p.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-gray-500" />
                        </Link>
                      </PermissionGuard>
                      <PermissionGuard module="mantenimiento" action="delete">
                        <button type="button" onClick={() => handleDelete(p.id, p.nombre)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                          <Trash className="w-4 h-4 text-red-400" />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.lastPage > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 cursor-pointer">
              Anterior
            </button>
            <span className="text-sm text-gray-600">Pág. {meta.page} de {meta.lastPage}</span>
            <button type="button" onClick={() => setPage(p => Math.min(meta.lastPage, p + 1))} disabled={page >= meta.lastPage}
              className="px-4 py-2 border border-gray-300 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 cursor-pointer">
              Siguiente
            </button>
          </div>
        )}
      </RequestState>
    </div>
  );
}

export default function PlanesPage() {
  return (
    <AuthGuard roleRequired={['admin', 'supervisor', 'tecnico', 'reporter']}>
      <PlanesPageContent />
    </AuthGuard>
  );
}

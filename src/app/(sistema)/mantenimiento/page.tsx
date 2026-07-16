'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useOrdenesTrabajo } from '@/hooks/useOrdenesTrabajo';
import { useUsuariosMap } from '@/hooks/useUsuariosMap';
import { formatEstadoOT, formatTipoMantenimiento } from '@/lib/orden-trabajo';
import { useRouter } from 'next/navigation';

type Vista = 'ordenes' | 'calendario';

const DIAS_SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

type TipoEvento = 'preventivo' | 'correctivo' | 'cancelado';

const EVENTO_STYLES: Record<TipoEvento, string> = {
  preventivo: 'bg-[#E3F2FD] text-[#1565C0] border-l-[#1565C0]',
  correctivo: 'bg-[#FFF3E0] text-[#E65100] border-l-[#E65100]',
  cancelado: 'bg-[#F5F5F5] text-[#757575] border-l-[#9E9E9E]',
};

function CalendarioView() {
  const router = useRouter();
  const hoy = new Date();
  const [fechaActual, setFechaActual] = useState(new Date());

  const cambiarMes = (incremento: number) => {
    const nueva = new Date(fechaActual);
    nueva.setMonth(nueva.getMonth() + incremento);
    setFechaActual(nueva);
  };

  const celdas = useMemo(() => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: { dia: number | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ dia: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ dia: d });
    while (cells.length % 7 !== 0) cells.push({ dia: null });
    return cells;
  }, [fechaActual]);

  const mes = fechaActual.toLocaleString('es', { month: 'long' });
  const año = fechaActual.getFullYear();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Calendario de mantenimientos</h2>
        <Link href="/mantenimiento/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nueva orden
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" aria-label="Mes anterior" onClick={() => cambiarMes(-1)}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 capitalize">{mes} {año}</h3>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" aria-label="Mes siguiente" onClick={() => cambiarMes(1)}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="bg-[#F9FAFB] py-3 text-center text-xs font-bold text-gray-500">{d}</div>
        ))}
        {celdas.map((c, i) => {
          const esHoy = c.dia !== null && fechaActual.getFullYear() === hoy.getFullYear() && fechaActual.getMonth() === hoy.getMonth() && c.dia === hoy.getDate();
          return (
            <div key={i} className={`bg-white min-h-[100px] p-2 ${c.dia ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'}`}>
              {c.dia && (
                <>
                  <div className="relative inline-block">
                    <span className={`text-sm font-semibold ${esHoy ? 'text-white' : 'text-gray-700'} relative z-10`}>{c.dia}</span>
                    {esHoy && <span className="absolute inset-0 -m-1 rounded-full bg-[#ECA03C] z-0" style={{ width: 'calc(100% + 12px)', height: 'calc(90% + 12px)' }} />}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-600">
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#1565C0]" /> Preventivo</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#E65100]" /> Correctivo</span>
        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#9E9E9E]" /> Cancelado</span>
      </div>
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  Abierta: 'bg-[#E3F2FD] text-[#1565C0]',
  'En progreso': 'bg-[#FFF3E0] text-[#E65100]',
  Pausada: 'bg-[#F3E5F5] text-[#6A1B9A]',
  Cerrada: 'bg-[#E8F5E9] text-[#2E7D32]',
  Cancelada: 'bg-[#FCE4EC] text-[#C62828]',
};

function EstadoBadge({ estado }: { estado: string }) {
  const s = badgeStyles[estado] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>
      {estado}
    </span>
  );
}

const PER_PAGE = 15;

export default function OrdenesTrabajoPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [vista, setVista] = useState<Vista>('ordenes');

  const { ordenes, meta, loading, error, empty, eliminarOrden } = useOrdenesTrabajo({
    search: debouncedSearch || undefined,
    estado: (filtroEstado as never) || undefined,
    page,
    perPage: PER_PAGE,
  });

  const { resolveNombre } = useUsuariosMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleDelete = useCallback(
    async (id: string, codigo: string) => {
      if (!window.confirm(`¿Eliminar la orden "${codigo}"? Esta acción no se puede deshacer.`)) return;
      try {
        await eliminarOrden(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar la orden');
      }
    },
    [eliminarOrden],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron órdenes para "${debouncedSearch}".`
    : 'No hay órdenes de trabajo registradas.';

  const stats = useMemo(() => {
    const counts = ordenes.reduce(
      (acc, o) => { acc[o.estado] = (acc[o.estado] ?? 0) + 1; return acc; },
      {} as Record<string, number>,
    );
    return [
      { label: 'Pendientes', key: 'abierta', count: counts['abierta'] ?? 0, bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' },
      { label: 'En progreso', key: 'en_proceso', count: counts['en_proceso'] ?? 0, bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
      { label: 'Completados', key: 'cerrada', count: counts['cerrada'] ?? 0, bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
      { label: 'Cancelados', key: 'cancelada', count: counts['cancelada'] ?? 0, bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
    ];
  }, [ordenes]);

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Mantenimiento"
        subtitle="Gestión de órdenes de trabajo y mantenimientos"
        variant="activos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar orden..."
        searchLabel="Buscar órdenes"
        className="mb-8"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setVista('ordenes')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            vista === 'ordenes'
              ? 'bg-[#2B405B] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Órdenes de trabajo
        </button>
        <button
          onClick={() => setVista('calendario')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            vista === 'calendario'
              ? 'bg-[#2B405B] text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Calendario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((item) => (
          <button
            key={item.label}
            onClick={() => { setFiltroEstado(prev => prev === item.key ? '' : item.key); setPage(1); }}
            className={`${item.bg} ${item.text} rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-opacity hover:opacity-80 ${filtroEstado === item.key ? 'ring-2 ring-[#ECA03C]' : ''}`}
          >
            <span className={`text-3xl font-bold`}>{item.count}</span>
            <span className="text-sm font-medium mt-1">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Filtro por estado */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
          className="pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#ECA03C] appearance-none cursor-pointer"
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          <option value="abierta">Abierta</option>
          <option value="en_proceso">En progreso</option>
          <option value="pausada">Pausada</option>
          <option value="cerrada">Cerrada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {vista === 'ordenes' && (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Órdenes de trabajo</h2>
          <Link href="/mantenimiento/nuevo" className="flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nueva orden
          </Link>
        </div>

        <RequestState
          loading={loading}
          error={error}
          empty={empty}
          loadingMessage="Cargando órdenes de trabajo..."
          emptyMessage={emptyMessage}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Orden</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Supervisor</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="border-b border-gray-100 last:border-0">
                    {/* Código + subtítulo de tipo — igual a activos: nombre + serial */}
                    <td className="py-5 pr-6">
                      <p className="font-semibold text-gray-900">{orden.codigo_ot}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatTipoMantenimiento(orden.tipo)}</p>
                    </td>
                    {/* Nombre del supervisor resuelto */}
                    <td className="py-5 pr-6 text-gray-700">
                      {resolveNombre(orden.supervisor_id)}
                    </td>
                    <td className="py-5 pr-6">
                      <EstadoBadge estado={formatEstadoOT(orden.estado)} />
                    </td>
                    <td className="py-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/mantenimiento/${orden.id}`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Ver ${orden.codigo_ot}`}
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <Link
                          href={`/mantenimiento/${orden.id}/editar`}
                          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label={`Editar ${orden.codigo_ot}`}
                        >
                          <Pencil className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                        <button
                          onClick={() => handleDelete(orden.id, orden.codigo_ot)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label={`Eliminar ${orden.codigo_ot}`}
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

          {!loading && !empty && meta.lastPage > 1 && (
            <nav className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600" aria-label="Paginación">
              <p>Página {meta.page} de {meta.lastPage} — {meta.total} órdenes</p>
              <div className="flex gap-2">
                <button type="button" disabled={meta.page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Anterior</button>
                <button type="button" disabled={meta.page >= meta.lastPage} onClick={() => setPage(p => p + 1)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">Siguiente</button>
              </div>
            </nav>
          )}
        </RequestState>
      </div>
      )}

      {vista === 'calendario' && (
        <CalendarioView />
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText, Pencil, CheckCircle, XCircle, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useOrdenDetalle } from '@/hooks/useOrdenDetalle';
import { useUsuariosMap } from '@/hooks/useUsuariosMap';
import { formatEstadoOT, formatTipoMantenimiento, formatCosto } from '@/lib/orden-trabajo';

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
    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${s}`}>{estado}</span>
  );
}

function formatFecha(fecha: string | null): string {
  if (!fecha) return '—';
  try { return new Date(fecha).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return fecha; }
}

export default function OrdenDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { orden, historial, loading, error, empty } = useOrdenDetalle(id);
  const { resolveNombre } = useUsuariosMap();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader title="Órdenes de Trabajo / Detalle" variant="activos" />

      <div className="mb-6">
        <Link href="/ordenes-trabajo" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      <RequestState loading={loading} error={error} empty={empty}
        loadingMessage="Cargando orden..." emptyMessage="Orden no encontrada."
      >
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-8" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>

          {/* Encabezado */}
          <div className="flex flex-col gap-3 border-b border-[#2E4365]/20 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">{orden?.codigo_ot || 'Sin código'}</h2>
                {orden && <EstadoBadge estado={formatEstadoOT(orden.estado)} />}
              </div>
              {orden && (
                <Link href={`/ordenes-trabajo/${orden.id}/editar`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E59D12] text-black font-semibold rounded-full text-sm shadow-sm hover:brightness-95 transition-all">
                  <Pencil className="w-4 h-4" strokeWidth={2} /> Editar
                </Link>
              )}
            </div>

            {/* Cards de info — 2 columnas igual que activos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Card: Información General */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <FileText className="w-4 h-4 text-[#E5920C]" /> Información General
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div><p className="text-xs text-gray-500 mb-1">Código OT</p><p className="font-semibold">{orden?.codigo_ot || '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Tipo</p><p className="font-semibold">{orden ? formatTipoMantenimiento(orden.tipo) : '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Estado</p><p className="font-semibold">{orden ? formatEstadoOT(orden.estado) : '—'}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Moneda</p><p className="font-semibold">{orden?.moneda || '—'}</p></div>
                </div>
              </div>

              {/* Card: Asignación */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <User className="w-4 h-4 text-[#E5920C]" /> Asignación
                </div>
                <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Supervisor</p>
                    <p className="font-semibold">{resolveNombre(orden?.supervisor_id)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Validado por</p>
                    <p className="font-semibold">{resolveNombre(orden?.validado_por_id)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cuerpo principal */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
            <div className="space-y-8">

              {/* Descripción */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <FileText className="w-4 h-4 text-[#E5920C]" /> Descripción
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{orden?.descripcion_trabajo || 'Sin descripción.'}</p>
              </div>

              {/* Costos */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <FileText className="w-4 h-4 text-[#E5920C]" /> Costos
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div><p className="text-xs text-gray-500 mb-1">Costo Estimado</p><p className="font-semibold">{formatCosto(orden?.costo_estimado ?? null, orden?.moneda)}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Costo Real</p><p className="font-semibold">{formatCosto(orden?.costo_real ?? null, orden?.moneda)}</p></div>
                </div>
              </div>

              {/* Fechas */}
              <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                  <FileText className="w-4 h-4 text-[#E5920C]" /> Fechas
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                  <div><p className="text-xs text-gray-500 mb-1">Apertura</p><p className="font-semibold">{formatFecha(orden?.fecha_apertura ?? null)}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Inicio Trabajo</p><p className="font-semibold">{formatFecha(orden?.fecha_inicio_trabajo ?? null)}</p></div>
                  <div><p className="text-xs text-gray-500 mb-1">Cierre</p><p className="font-semibold">{formatFecha(orden?.fecha_cierre ?? null)}</p></div>
                  {orden?.fecha_validacion && (
                    <div><p className="text-xs text-gray-500 mb-1">Validación</p><p className="font-semibold">{formatFecha(orden.fecha_validacion)}</p></div>
                  )}
                </div>
              </div>

              {/* Historial de estados */}
              {historial.length > 0 && (
                <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm mb-4">
                    <FileText className="w-4 h-4 text-[#E5920C]" /> Historial de Estados
                  </div>
                  <div className="space-y-3">
                    {historial.map((h) => (
                      <div key={h.id} className="flex items-center gap-3 text-sm text-gray-700">
                        {h.estado_nuevo === 'cerrada' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         h.estado_nuevo === 'cancelada' ? <XCircle className="w-4 h-4 text-red-500" /> :
                         <span className="w-4 h-4 rounded-full border border-gray-400 shrink-0" />}
                        <span className="font-medium">{h.estado_anterior ? formatEstadoOT(h.estado_anterior) : '—'} → {formatEstadoOT(h.estado_nuevo)}</span>
                        <span className="text-gray-400 text-xs">{formatFecha(h.fecha_cambio)}</span>
                        {h.motivo && <span className="text-gray-500 italic">({h.motivo})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar — Estado actual */}
            <div className="rounded-3xl p-5 bg-white shadow-sm border border-gray-100 h-fit">
              <h3 className="text-gray-800 font-bold text-base mb-5">Estado</h3>
              <div className="space-y-3">
                {['abierta', 'en_proceso', 'pausada', 'cerrada', 'cancelada'].map((e) => (
                  <div key={e} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${orden?.estado === e ? 'border-[#ECA03C]' : 'border-gray-200 bg-white'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${orden?.estado === e ? 'bg-[#8B4513]' : 'bg-transparent border border-gray-300'}`} />
                    <span className="text-sm text-gray-700">{formatEstadoOT(e)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </RequestState>
    </div>
  );
}

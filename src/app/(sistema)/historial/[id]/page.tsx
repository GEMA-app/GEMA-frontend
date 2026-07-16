'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, User, Tag, Monitor, Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { extractResource } from '@/lib/jsonapi';
import { mapApiHistorialToUi } from '@/lib/historial';
import type { HistorialEntry } from '@/types/historial';

function formatFecha(fecha: string): string {
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-VE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  } catch {
    return fecha;
  }
}

function DetallesTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (!entries.length) return <p className="text-sm text-gray-500">Sin detalles adicionales</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="px-4 py-2.5 font-medium text-gray-600 bg-gray-50 w-1/3">{key.replace(/_/g, ' ')}</td>
              <td className="px-4 py-2.5 text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistorialDetail() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<HistorialEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); setError('ID no especificado.'); return; }
    let cancelled = false;
    (async () => {
      try {
        const empresaId = await requireEmpresaId();
        const payload = await fetchWithAuth<Record<string, unknown>>(
          `/v1/empresas/${empresaId}/auditorias/${id}`,
        );
        if (cancelled) return;

        const resource = extractResource(payload);
        const mapped = resource ? mapApiHistorialToUi(resource) : null;

        if (mapped) {
          const attrs = (resource?.attributes ?? {}) as Record<string, unknown>;
          const usuarioId = attrs.usuario_id as string | undefined;
          if (usuarioId) {
            try {
              const userPayload = await fetchWithAuth<{ data: { attributes: Record<string, unknown> } }>(
                `/v1/empresas/${empresaId}/usuarios/${usuarioId}`,
              );
              const attrs = userPayload?.data?.attributes ?? {};
              if (attrs.nombre) mapped.usuario.nombre = attrs.nombre as string;
              if (attrs.email) mapped.usuario.email = attrs.email as string;
              const roles = attrs.roles;
              if (Array.isArray(roles)) {
                mapped.usuario.roles = roles.map((r: unknown) => {
                  if (typeof r === 'string') return r;
                  const obj = r as Record<string, unknown>;
                  // Intentar múltiples campos en orden de preferencia
                  const name =
                    (typeof obj?.nombre === 'string' && obj.nombre) ||
                    (typeof obj?.name === 'string' && obj.name) ||
                    (typeof obj?.display_name === 'string' && obj.display_name) ||
                    (typeof obj?.slug === 'string' && obj.slug) ||
                    null;
                  return name ?? String(r);
                });
              }
            } catch {
              // fallback al UUID
            }
          }
        }

        setEntry(mapped);
        if (!mapped) setError('Registro no encontrado');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F3F4F6] p-8 w-full font-sans">
      <PageHeader title="Historial / Detalle" variant="activos" />

      <div className="mb-6">
        <Link href="/historial" className="flex items-center text-gray-700 hover:text-black font-medium transition-colors gap-2 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al historial
        </Link>
      </div>

      <RequestState
        loading={loading}
        error={error}
        empty={!loading && !error && !entry}
        loadingMessage="Cargando registro..."
        emptyMessage="Registro no encontrado."
      >
        <div className="space-y-6">
          {/* info general */}
          <div className="rounded-3xl p-8 border border-gray-100 shadow-sm" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalle del registro</h2>
            <div className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100 divide-y divide-gray-100">
              <div className="flex items-start gap-3 py-3">
                <div className="w-5 h-5 text-[#E5920C] mt-0.5"><User className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Usuario</p>
                  <p className="text-sm font-semibold text-gray-900">{entry?.usuario.nombre || '—'}</p>
                </div>
              </div>
              {entry?.usuario.email && (
                <div className="flex items-start gap-3 py-3">
                  <div className="w-5 h-5 text-[#E5920C] mt-0.5"><Mail className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Correo</p>
                    <p className="text-sm font-semibold text-gray-900">{entry.usuario.email}</p>
                  </div>
                </div>
              )}
              {entry?.usuario.roles && entry.usuario.roles.length > 0 && (
                <div className="flex items-start gap-3 py-3">
                  <div className="w-5 h-5 text-[#E5920C] mt-0.5"><Tag className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Rol</p>
                    <p className="text-sm font-semibold text-gray-900">{entry.usuario.roles.join(', ')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 py-3">
                <div className="w-5 h-5 text-[#E5920C] mt-0.5"><Tag className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Acción</p>
                  <p className="text-sm font-semibold text-gray-900">{entry?.accion || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <div className="w-5 h-5 text-[#E5920C] mt-0.5"><Clock className="w-5 h-5" /></div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Fecha</p>
                  <p className="text-sm font-semibold text-gray-900">{entry?.fecha ? formatFecha(entry.fecha) : '—'}</p>
                </div>
              </div>
              {entry?.ip && (
                <div className="flex items-start gap-3 py-3">
                  <div className="w-5 h-5 text-[#E5920C] mt-0.5"><Monitor className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Dirección IP</p>
                    <p className="text-sm font-semibold text-gray-900">{entry.ip}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* detalles clave-valor */}
          <div className="rounded-3xl p-8 border border-gray-100 shadow-sm" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles</h2>
            <div className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100">
              <DetallesTable data={entry?.detalles ?? {}} />
            </div>
          </div>
        </div>
      </RequestState>
    </div>
  );
}

export default function HistorialDetailPage() {
  return <HistorialDetail />;
}

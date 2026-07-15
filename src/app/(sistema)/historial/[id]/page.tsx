'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, User, Tag, FileText, Monitor } from 'lucide-react';
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
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return fecha;
  }
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
              const userName = userPayload?.data?.attributes?.nombre as string || userPayload?.data?.attributes?.email as string;
              if (userName) mapped.usuario.nombre = userName;
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

  function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <div className="flex items-start gap-3 py-3">
        <div className="w-5 h-5 text-[#E5920C] mt-0.5">{icon}</div>
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-gray-900">{value || '—'}</p>
        </div>
      </div>
    );
  }

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
        <div className="rounded-3xl p-8 border border-gray-100 shadow-sm" style={{ backgroundColor: 'rgba(46, 70, 101, 0.05)' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalle del registro</h2>
          <div className="rounded-3xl p-6 bg-white shadow-sm border border-gray-100 divide-y divide-gray-100">
            <DetailRow icon={<User className="w-5 h-5" />} label="Usuario" value={entry?.usuario.nombre || '—'} />
            <DetailRow icon={<Tag className="w-5 h-5" />} label="Rol" value={entry?.usuario.rol || '—'} />
            <DetailRow icon={<Tag className="w-5 h-5" />} label="Acción" value={entry?.accion || '—'} />
            <DetailRow icon={<FileText className="w-5 h-5" />} label="Descripción" value={entry?.descripcion || '—'} />
            <DetailRow icon={<Clock className="w-5 h-5" />} label="Fecha" value={entry?.fecha ? formatFecha(entry.fecha) : '—'} />
            {entry?.metadata?.ip && (
              <DetailRow icon={<Monitor className="w-5 h-5" />} label="Dirección IP" value={entry.metadata.ip} />
            )}
          </div>
        </div>
      </RequestState>
    </div>
  );
}

export default function HistorialDetailPage() {
  return <HistorialDetail />;
}

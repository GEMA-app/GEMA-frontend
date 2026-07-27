'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, User, Tag, Monitor, Mail, Box } from 'lucide-react';
import { Badge, type EstadoBadgeType } from '@/components/ui/Badge';
import { RequestState } from '@/components/ui/RequestState';
import { getHistorialEntry } from '@/services/historial';
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

function DetallesTable({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  if (!entries.length) return <p className="text-sm text-gema-primary/50 dark:text-white/40">Sin detalles adicionales</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <td className="px-4 py-2.5 font-medium text-gema-primary/70 dark:text-white/60 bg-gray-50 dark:bg-white/5 w-1/3">
                {key.replace(/_/g, ' ')}
              </td>
              <td className="px-4 py-2.5 text-gema-primary dark:text-white">
                {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function HistorialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<HistorialEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('ID no especificado.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const mapped = await getHistorialEntry(id);
        if (cancelled) return;
        setEntry(mapped);
        if (!mapped) setError('Registro no encontrado');
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Detalle del evento
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Información completa de auditoría
          </p>
        </div>
        <Link
          href="/historial"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gema-primary dark:text-white font-medium text-sm transition-colors cursor-pointer w-fit"
        >
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
          <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gema-primary dark:text-white mb-6">Información General</h2>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              <div className="flex items-start gap-3 py-3">
                <User className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Usuario</p>
                  <p className="text-sm font-semibold text-gema-primary dark:text-white">{entry?.usuario.nombre || '—'}</p>
                </div>
              </div>
              {entry?.usuario.email && (
                <div className="flex items-start gap-3 py-3">
                  <Mail className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Correo</p>
                    <p className="text-sm font-semibold text-gema-primary dark:text-white">{entry.usuario.email}</p>
                  </div>
                </div>
              )}
              {entry?.usuario.roles && entry.usuario.roles.length > 0 && (
                <div className="flex items-start gap-3 py-3">
                  <Tag className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Rol</p>
                    <p className="text-sm font-semibold text-gema-primary dark:text-white">{entry.usuario.roles.join(', ')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 py-3">
                <Box className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Módulo</p>
                  <div className="mt-1">
                    <Badge estado={(entry?.modulo ?? 'sistema').toLowerCase() as EstadoBadgeType} />
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <Tag className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Acción</p>
                  <p className="text-sm font-semibold text-gema-primary dark:text-white capitalize">{entry?.accion.replace(/_/g, ' ') || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-3">
                <Clock className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Fecha y Hora</p>
                  <p className="text-sm font-semibold text-gema-primary dark:text-white">{entry?.fecha ? formatFecha(entry.fecha) : '—'}</p>
                </div>
              </div>
              {entry?.ip && (
                <div className="flex items-start gap-3 py-3">
                  <Monitor className="w-5 h-5 text-gema-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gema-primary/50 dark:text-white/40 mb-0.5">Dirección IP</p>
                    <p className="text-sm font-semibold font-mono text-gema-primary dark:text-white">{entry.ip}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gema-primary dark:text-white mb-4">Detalles Técnicos</h2>
            <DetallesTable data={entry?.detalles ?? {}} />
          </div>
        </div>
      </RequestState>
    </div>
  );
}

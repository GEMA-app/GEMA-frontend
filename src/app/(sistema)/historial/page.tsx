'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RequestState } from '@/components/ui/RequestState';
import { useHistorial } from '@/hooks/useHistorial';
import type { HistorialEntry } from '@/types/historial';

function formatFecha(fecha: string): string {
  try {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fecha;
  }
}

function AccionBadge({ accion }: { accion: string }) {
  const colors: Record<string, string> = {
    inicio_sesion: 'bg-[#E8F5E9] text-[#2E7D32]',
    cierre_sesion: 'bg-[#F3E5F5] text-[#6A1B9A]',
    crear: 'bg-[#E3F2FD] text-[#1565C0]',
    actualizar: 'bg-[#FFF3E0] text-[#E65100]',
    eliminar: 'bg-[#FCE4EC] text-[#C62828]',
  };
  const s = colors[accion] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s}`}>
      {accion.replace(/_/g, ' ')}
    </span>
  );
}

export default function HistorialPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('');

  const { entries, loading, loadingMore, error, empty, hasMore, loadMore } = useHistorial({
    search: debouncedSearch || undefined,
    accion: filtroAccion || undefined,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loadingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const emptyMessage = debouncedSearch
    ? `No se encontraron registros para "${debouncedSearch}".`
    : 'No hay registros de historial.';

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <PageHeader
        title="Historial"
        subtitle="Registro de actividades y cambios en el sistema"
        variant="activos"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar en historial..."
        searchLabel="Buscar en historial"
        className="mb-8"
      />
      <div className="flex items-center gap-3 mt-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filtroAccion}
            onChange={(e) => setFiltroAccion(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#ECA03C] appearance-none cursor-pointer"
            aria-label="Filtrar por acción"
          >
            <option value="">Todas las acciones</option>
            <option value="inicio_sesion">Inicio de sesión</option>
            <option value="cierre_sesion">Cierre de sesión</option>
            <option value="crear">Crear</option>
            <option value="actualizar">Actualizar</option>
            <option value="eliminar">Eliminar</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Actividad reciente</h2>

        <RequestState
          loading={loading}
          error={error}
          empty={empty}
          loadingMessage="Cargando historial..."
          emptyMessage={emptyMessage}
        >
          <div className="space-y-4">
            {entries.map((entry: HistorialEntry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900 text-sm">
                      {entry.usuario.nombre}
                    </span>
                    <span className="text-xs text-gray-400">{entry.usuario.rol}</span>
                    <AccionBadge accion={entry.accion} />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{entry.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatFecha(entry.fecha)}</p>
                </div>
                <Link
                  href={`/historial/${entry.id}`}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                  aria-label="Ver detalle"
                >
                  <Eye className="w-5 h-5" strokeWidth={1.5} />
                </Link>
              </div>
            ))}
          </div>

          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <p className="text-center text-sm text-gray-400 mt-4">Cargando más...</p>
          )}
        </RequestState>
      </div>
    </div>
  );
}

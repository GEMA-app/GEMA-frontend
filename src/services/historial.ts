import { fetchWithAuth } from '@/lib/api';
import {
  extractHistorialFromResponse,
  extractHistorialMeta,
  type HistorialMeta,
} from '@/lib/historial';
import type { HistorialEntry } from '@/types/historial';

export interface HistorialQuery {
  page?: number;
  limit?: number;
  search?: string;
  usuario_id?: string;
  accion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface HistorialResponse {
  entries: HistorialEntry[];
  meta: HistorialMeta;
}

function buildHistorialQuery(params: HistorialQuery): string {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set('page', String(params.page));
  }
  if (params.limit) {
    searchParams.set('per_page', String(params.limit));
  }
  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }
  if (params.accion) {
    searchParams.set('accion', params.accion);
  }
  if (params.fecha_desde) {
    searchParams.set('fecha_inicio', params.fecha_desde);
  }
  if (params.fecha_hasta) {
    searchParams.set('fecha_fin', params.fecha_hasta);
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function getHistorial(params: HistorialQuery = {}): Promise<HistorialResponse> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const query = buildHistorialQuery({ ...params, page, limit });

  const payload = await fetchWithAuth<unknown>(`/admin/historial-logs${query}`);

  return {
    entries: extractHistorialFromResponse(payload),
    meta: extractHistorialMeta(payload, page, limit),
  };
}

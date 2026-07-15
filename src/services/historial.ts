import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
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

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/auditorias`;
}

function buildHistorialQuery(params: HistorialQuery): string {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  searchParams.set('offset', String((page - 1) * limit));
  searchParams.set('limit', String(limit));

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
  const url = await baseUrl();
  const query = buildHistorialQuery({ ...params, page, limit });

  const payload = await fetchWithAuth<unknown>(`${url}${query}`);

  return {
    entries: extractHistorialFromResponse(payload),
    meta: extractHistorialMeta(payload, page, limit),
  };
}

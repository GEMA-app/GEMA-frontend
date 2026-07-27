import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import {
  extractHistorialFromResponse,
  extractHistorialMeta,
  mapApiHistorialToUi,
  type HistorialMeta,
} from '@/lib/historial';
import { extractResource } from '@/lib/jsonapi';
import type { HistorialEntry } from '@/types/historial';

export interface HistorialQuery {
  page?: number;
  limit?: number;
  search?: string;
  usuario_id?: string;
  modulo?: string;
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

  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.usuario_id) {
    searchParams.set('usuario_id', params.usuario_id);
  }
  if (params.modulo) {
    searchParams.set('modulo', params.modulo);
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
  const url = await baseUrl();
  const query = buildHistorialQuery({ ...params, page, limit });

  const payload = await fetchWithAuth<unknown>(`${url}${query}`);

  return {
    entries: extractHistorialFromResponse(payload),
    meta: extractHistorialMeta(payload, page, limit),
  };
}

export async function getHistorialEntry(id: string): Promise<HistorialEntry | null> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const resource = extractResource(payload as Record<string, unknown>);
  return resource ? mapApiHistorialToUi(resource) : null;
}

import { fetchWithAuth } from '@/lib/api';
import {
  buildReporteFromInput,
  mapReporteResponse,
  mapReportesFromResponse,
  mapReportesResumenFromResponse,
} from '@/lib/reportes';
import {
  mockCreateReporte,
  mockFetchReportes,
  mockFetchReportesResumen,
} from '@/data/mockReportesApi';
import type {
  NuevoReporteInput,
  Reporte,
  ReportesQuery,
  ReportesResumen,
  ReportesResponse,
} from '@/types/reporte';

const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_REPORTES !== 'false';

function buildReportesQuery(params: ReportesQuery): string {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;

  searchParams.set('page', String(page));
  searchParams.set('per_page', String(perPage));

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  if (params.tipo && params.tipo !== 'todos') {
    searchParams.set('tipo', params.tipo);
  }

  if (params.estado) {
    searchParams.set('estado', params.estado);
  }

  return `?${searchParams.toString()}`;
}

export async function getReportes(params: ReportesQuery = {}): Promise<ReportesResponse> {
  if (USE_MOCK) {
    return mockFetchReportes(params);
  }

  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildReportesQuery({ ...params, page, perPage });

  const payload = await fetchWithAuth<unknown>(`/mantenimiento/reportes${query}`);
  return mapReportesFromResponse(payload, page, perPage);
}

export async function getReportesResumen(): Promise<ReportesResumen> {
  if (USE_MOCK) {
    return mockFetchReportesResumen();
  }

  const payload = await fetchWithAuth<unknown>('/mantenimiento/reportes/resumen');
  const resumen = mapReportesResumenFromResponse(payload);

  if (!resumen) {
    throw new Error('No se pudo interpretar el resumen de reportes.');
  }

  return resumen;
}

export async function createReporte(
  input: NuevoReporteInput,
  index: number,
): Promise<Reporte> {
  if (USE_MOCK) {
    return mockCreateReporte(input);
  }

  const payload = await fetchWithAuth<unknown>('/mantenimiento/reportes', {
    method: 'POST',
    json: {
      titulo: input.titulo,
      descripcion: input.descripcion,
      tipo: input.tipo,
      tipo_mantenimiento: input.tipo,
      prioridad: input.prioridad,
      asignado: input.asignado,
      responsable: input.asignado,
      estado: 'programado',
    },
  });

  const reporte = mapReporteResponse(payload);
  if (reporte) {
    return reporte;
  }

  return buildReporteFromInput(input, index);
}

export { USE_MOCK as isReportesMockMode };

import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import {
  buildReporteFromInput,
  mapReporteResponse,
  mapReportesFromResponse,
} from '@/lib/reportes';
import type {
  NuevoReporteInput,
  Reporte,
  ReportesQuery,
  ReportesResponse,
} from '@/types/reporte';

function buildReportesQuery(params: ReportesQuery): string {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const limit = params.perPage ?? 15;
  const offset = (page - 1) * limit;

  searchParams.set('offset', String(offset));
  searchParams.set('limit', String(limit));

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  if (params.estado) {
    searchParams.set('status', params.estado);
  }

  return `?${searchParams.toString()}`;
}

export async function getReportes(params: ReportesQuery = {}): Promise<ReportesResponse> {
  const empresaId = await requireEmpresaId();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildReportesQuery({ ...params, page, perPage });

  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/reportes-fallas${query}`,
  );
  return mapReportesFromResponse(payload, page, perPage);
}

export async function createReporte(input: NuevoReporteInput): Promise<Reporte> {
  const empresaId = await requireEmpresaId();

  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/reportes-fallas`,
    {
      method: 'POST',
      contentType: 'json-api',
      json: {
        data: {
          type: 'failure-reports',
          attributes: {
            title: input.titulo,
            description: input.descripcion,
            location: input.ubicacion ?? '',
            priority: input.prioridad,
            reported_by: input.asignado,
          },
        },
      },
    },
  );

  return mapReporteResponse(payload) ?? buildReporteFromInput(input, Date.now());
}

import type { ActualizarReporteInput } from '@/types/reporte';

export async function getReporteById(id: string): Promise<Reporte | null> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/reportes-fallas/${id}`,
  );
  return mapReporteResponse(payload);
}

export async function updateReporte(id: string, input: ActualizarReporteInput): Promise<Reporte | null> {
  const empresaId = await requireEmpresaId();
  const attributes: Record<string, unknown> = { version: input.version };

  if (input.titulo !== undefined) attributes.title = input.titulo;
  if (input.descripcion !== undefined) attributes.description = input.descripcion;
  if (input.ubicacion !== undefined) attributes.location = input.ubicacion;
  if (input.prioridad !== undefined) attributes.priority = input.prioridad;
  if (input.estado !== undefined) attributes.status = input.estado;

  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/reportes-fallas/${id}`,
    {
      method: 'PATCH',
      contentType: 'json-api',
      json: { data: { type: 'failure-reports', attributes } },
    },
  );
  return mapReporteResponse(payload);
}

export async function deleteReporte(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/reportes-fallas/${id}`, {
    method: 'DELETE',
  });
}

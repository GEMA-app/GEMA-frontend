import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { buildOffsetQuery } from '@/lib/pagination';
import { extractReportesFromResponse, extractReportesMeta, mapReporteFromResponse } from '@/lib/reportes';
import type {
  ActualizarReporteInput,
  NuevoReporteInput,
  Reporte,
  ReportesQuery,
  ReportesResponse,
} from '@/types/reporte';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/reportes-fallas`;
}

export async function getReportes(params: ReportesQuery = {}): Promise<ReportesResponse> {
  const url = await baseUrl();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildOffsetQuery({
    page,
    perPage,
    status: params.status,
    priority: params.priority,
    search: params.search,
  });
  const payload = await fetchWithAuth<unknown>(`${url}${query}`);
  return {
    reportes: extractReportesFromResponse(payload),
    meta: extractReportesMeta(payload, page, perPage),
  };
}

export async function getReporteById(id: string): Promise<Reporte> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const reporte = mapReporteFromResponse(payload);
  if (!reporte) throw new Error('No se pudo interpretar el reporte.');
  return reporte;
}

export async function createReporte(input: NuevoReporteInput): Promise<Reporte> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'failure-reports',
        attributes: {
          title: input.title,
          description: input.description,
          location: input.location,
          priority: input.priority,
          reported_by: input.reported_by,
          activo_id: input.activo_id ?? null,
        },
      },
    },
  });
  const reporte = mapReporteFromResponse(payload);
  if (!reporte) throw new Error('No se pudo interpretar el reporte creado.');
  return reporte;
}

export async function updateReporte(id: string, input: ActualizarReporteInput): Promise<Reporte> {
  const url = await baseUrl();
  const { version, ...rest } = input;
  const attributes: Record<string, unknown> = { version };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) attributes[key] = value;
  }
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'failure-reports', attributes } },
  });
  const reporte = mapReporteFromResponse(payload);
  if (!reporte) throw new Error('No se pudo interpretar el reporte actualizado.');
  return reporte;
}

export async function deleteReporte(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}
import { buildOffsetQuery } from '@/lib/pagination';
import { extractActivosFromResponse, extractActivosMeta, normalizeAssetStatus } from '@/lib/activos';
import { extractResourceList } from '@/lib/jsonapi';
import type {
  ActivosQuery,
  ActivosResponse,
  ActivoResponse,
  CatalogArticleResponse,
  LogEstadoActivo,
} from '@/types/activo';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';

export async function getActivos(params: ActivosQuery = {}): Promise<ActivosResponse> {
  const empresaId = await requireEmpresaId();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;

  const query = buildOffsetQuery({
    page,
    perPage,
    search: params.search,
    estado: params.estado,
    ubicacion_id: params.ubicacionId,
  });

  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/activos${query}`,
  );

  return {
    activos: extractActivosFromResponse(payload),
    meta: extractActivosMeta(payload, page, perPage),
  };
}

export async function createActivo(attrs: {
  articulo_id: string;
  serial_interno: string;
  codigo_activo: string;
  estado: string;
  ubicacion_id: string | null;
  fecha_adquisicion: string | null;
  valor_monetario: number | null;
  moneda: string;
}): Promise<void> {
  const empresaId = await requireEmpresaId();

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'assets',
        attributes: {
          articulo_id: attrs.articulo_id,
          serial_interno: attrs.serial_interno,
          codigo_activo: attrs.codigo_activo,
          estado: attrs.estado,
          ubicacion_id: attrs.ubicacion_id,
          fecha_adquisicion: attrs.fecha_adquisicion,
          valor_monetario: attrs.valor_monetario,
          moneda: attrs.moneda,
        },
      },
    },
  });
}

export async function deleteActivo(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'DELETE',
  });
}

export async function getActivo(id: string): Promise<ActivoResponse> {
  const empresaId = await requireEmpresaId();
  const res = await fetchWithAuth<{ data: { id: string; attributes: Record<string, unknown> } }>(
    `/v1/empresas/${empresaId}/activos/${id}`,
  );
  const a = res.data.attributes;
  return {
    id: res.data.id,
    empresa_id: (a.empresa_id as string) || empresaId,
    serial_interno: a.serial_interno as string,
    codigo_activo: a.codigo_activo as string,
    estado: normalizeAssetStatus((a.estado as string) || 'operativo'),
    ubicacion_id: (a.ubicacion_id as string) || null,
    fecha_adquisicion: (a.fecha_adquisicion as string) || null,
    valor_monetario: (a.valor_monetario as number) ?? null,
    moneda: (a.moneda as string) || 'USD',
    articulo_id: a.articulo_id as string,
    version: (a.version as number) ?? 1,
  };
}

export async function getCatalogArticle(id: string): Promise<CatalogArticleResponse> {
  const empresaId = await requireEmpresaId();
  const res = await fetchWithAuth<{ data: { id: string; attributes: Record<string, unknown> } }>(
    `/v1/empresas/${empresaId}/catalogo/articulos/${id}`,
  );
  const a = res.data.attributes;
  return {
    id: res.data.id,
    name: a.name as string,
    manufacturer: (a.manufacturer as string) || null,
    model: (a.model as string) || null,
  };
}

export async function updateActivo(
  id: string,
  data: Partial<{
    serial_interno: string;
    codigo_activo: string;
    ubicacion_id: string | null;
    fecha_adquisicion: string | null;
    estado: string;
    valor_monetario: number | null;
    moneda: string;
  }> & { version: number },
): Promise<void> {
  const empresaId = await requireEmpresaId();
  const attrs: Record<string, unknown> = { version: data.version };
  if (data.serial_interno !== undefined) attrs.serial_interno = data.serial_interno;
  if (data.codigo_activo !== undefined) attrs.codigo_activo = data.codigo_activo;
  if (data.ubicacion_id !== undefined) attrs.ubicacion_id = data.ubicacion_id;
  if (data.fecha_adquisicion !== undefined) attrs.fecha_adquisicion = data.fecha_adquisicion;
  if (data.estado !== undefined) attrs.estado = data.estado;
  if (data.valor_monetario !== undefined) attrs.valor_monetario = data.valor_monetario;
  if (data.moneda !== undefined) attrs.moneda = data.moneda;

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'assets', attributes: attrs } },
  });
}

export async function getHistorialEstadosActivo(activoId: string): Promise<LogEstadoActivo[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/activos/${activoId}/historial-estados`,
  );
  return extractResourceList(payload).map((r) => ({
    id: r.id,
    activo_id: (r.attributes.activo_id as string) ?? activoId,
    estado_anterior: r.attributes.estado_anterior
      ? normalizeAssetStatus(r.attributes.estado_anterior as string)
      : null,
    estado_nuevo: normalizeAssetStatus((r.attributes.estado_nuevo as string) || 'operativo'),
    motivo: (r.attributes.motivo as string) || null,
    fecha_cambio: (r.attributes.fecha_cambio as string) ?? '',
    usuario_id: (r.attributes.usuario_id as string) || null,
  }));
}

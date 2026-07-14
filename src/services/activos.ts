import { buildOffsetQuery } from '@/lib/pagination';
import { extractActivosFromResponse, extractActivosMeta, normalizeAssetStatus } from '@/lib/activos';
import type { ActivoResponse, ActivosQuery, ActivosResponse, CreateActivoForm } from '@/types/activo';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { findOrCreateCatalogArticle } from '@/services/catalogo';

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

export async function getActivo(id: string): Promise<ActivoResponse> {
  const empresaId = await requireEmpresaId();
  const res = await fetchWithAuth<{ data: { id: string; attributes: Record<string, unknown> } }>(
    `/v1/empresas/${empresaId}/activos/${id}`,
  );
  const a = res.data.attributes;
  return {
    id: res.data.id,
    serial_interno: a.serial_interno as string,
    codigo_activo: a.codigo_activo as string,
    estado: a.estado as string,
    ubicacion_id: (a.ubicacion_id as string) || null,
    fecha_adquisicion: (a.fecha_adquisicion as string) || null,
    valor_monetario: (a.valor_monetario as number) ?? null,
    moneda: (a.moneda as string) || 'USD',
    articulo_id: a.articulo_id as string,
    version: a.version as number,
  };
}

export async function createActivo(data: CreateActivoForm): Promise<void> {
  const empresaId = await requireEmpresaId();
  const articuloId = await findOrCreateCatalogArticle(data.nombre, data.marca);
  const valor = data.valorMonetario ? parseFloat(data.valorMonetario.replace(',', '.')) : null;

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'assets',
        attributes: {
          articulo_id: articuloId,
          serial_interno: data.nombre,
          codigo_activo: data.codigo,
          estado: normalizeAssetStatus(data.estadoInicial),
          ubicacion_id: data.ubicacion || null,
          fecha_adquisicion: data.fechaCompra || null,
          valor_monetario: valor,
          moneda: data.moneda || 'USD',
        },
      },
    },
  });
}

export async function updateActivo(id: string, data: Partial<CreateActivoForm> & { version: number }): Promise<void> {
  const empresaId = await requireEmpresaId();
  const attrs: Record<string, unknown> = { version: data.version };
  if (data.nombre !== undefined) attrs.serial_interno = data.nombre;
  if (data.codigo !== undefined) attrs.codigo_activo = data.codigo;
  if (data.ubicacion !== undefined) attrs.ubicacion_id = data.ubicacion || null;
  if (data.fechaCompra !== undefined) attrs.fecha_adquisicion = data.fechaCompra || null;
  if (data.estadoInicial !== undefined) attrs.estado = normalizeAssetStatus(data.estadoInicial);
  if (data.valorMonetario !== undefined) {
    attrs.valor_monetario = data.valorMonetario
      ? parseFloat(data.valorMonetario.replace(',', '.'))
      : null;
  }
  if (data.moneda !== undefined) attrs.moneda = data.moneda || 'USD';

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'assets', attributes: attrs } },
  });
}

export async function deleteActivo(id: string): Promise<void> {
  const empresaId = await requireEmpresaId();
  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'DELETE',
  });
}

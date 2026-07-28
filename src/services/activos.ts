import { buildOffsetQuery } from '@/lib/pagination';
import { extractActivosFromResponse, extractActivosMeta, normalizeAssetStatus } from '@/lib/activos';
import { extractResourceList } from '@/lib/jsonapi';
import type { ActivosQuery, ActivosResponse, LogEstadoActivo } from '@/types/activo';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { createArticulo, deleteArticulo, getArticulos } from '@/services/catalogo';

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

export interface CreateActivoForm {
  nombre: string;
  codigo: string;
  marca: string;
  ubicacion: string;
  fechaCompra: string;
  valorMonetario: string;
  moneda: string;
  estadoInicial: string;
}

export async function createActivo(data: CreateActivoForm): Promise<void> {
  const empresaId = await requireEmpresaId();

  const existentes = await getArticulos({ search: data.nombre, perPage: 1 });
  let articuloId: string;
  let articuloCreado = false;

  if (existentes.length > 0) {
    articuloId = existentes[0].id;
  } else {
    const nuevo = await createArticulo({
      name: data.nombre,
      manufacturer: data.marca || undefined,
      model: data.nombre,
    });
    articuloId = nuevo.id;
    articuloCreado = true;
  }

  const valor = data.valorMonetario ? parseFloat(data.valorMonetario.replace(',', '.')) : null;

  try {
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
  } catch (err) {
    if (articuloCreado) {
      try { await deleteArticulo(articuloId); } catch (e) { console.error('rollback: fallo al eliminar articulo huerfano', e); }
    }
    throw err;
  }
}

export interface CreateActivoDirectoInput {
  articuloId: string;
  ubicacionId: string;
  serialInterno: string;
  codigoActivo: string;
  fechaAdquisicion: string;
  valorMonetario: string;
  moneda: string;
}

export async function createActivoDirecto(input: CreateActivoDirectoInput): Promise<void> {
  const empresaId = await requireEmpresaId();
  const valor = input.valorMonetario ? parseFloat(input.valorMonetario.replace(',', '.')) : null;

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'assets',
        attributes: {
          articulo_id: input.articuloId,
          ubicacion_id: input.ubicacionId || null,
          serial_interno: input.serialInterno,
          codigo_activo: input.codigoActivo,
          fecha_adquisicion: input.fechaAdquisicion || null,
          valor_monetario: valor,
          moneda: input.moneda || 'USD',
          estado: 'operativo',
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

export interface ActivoResponse {
  id: string;
  serial_interno: string;
  codigo_activo: string;
  estado: string;
  ubicacion_id: string | null;
  fecha_adquisicion: string | null;
  valor_monetario: number | null;
  moneda: string;
  articulo_id: string;
  version: number;
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

export interface CatalogArticleResponse {
  id: string;
  name: string;
  manufacturer: string | null;
  model: string | null;
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

export async function getHistorialEstadosActivo(activoId: string): Promise<LogEstadoActivo[]> {
  const empresaId = await requireEmpresaId();
  const payload = await fetchWithAuth<unknown>(
    `/v1/empresas/${empresaId}/activos/${activoId}/historial-estados`,
  );
  return extractResourceList(payload).map((r) => ({
    id: r.id,
    empresa_id: (r.attributes.empresa_id as string) ?? empresaId,
    activo_id: (r.attributes.activo_id as string) ?? activoId,
    estado_anterior: r.attributes.estado_anterior
      ? normalizeAssetStatus(r.attributes.estado_anterior as string)
      : null,
    estado_nuevo: normalizeAssetStatus((r.attributes.estado_nuevo as string) || 'operativo'),
    motivo: (r.attributes.motivo as string) || null,
    fecha_cambio: (r.attributes.fecha_cambio as string) ?? '',
    usuario_id: (r.attributes.usuario_id as string) || null,
    version: (r.attributes.version as number) ?? 1,
  }));
}

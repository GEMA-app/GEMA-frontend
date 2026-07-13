import { fetchWithAuth, requireEmpresaId } from '@/lib/api';

function normalizeAssetStatus(raw: string): string {
  const map: Record<string, string> = {
    'operativo': 'operativo',
    'en mantenimiento': 'en_mantenimiento',
    'para revisión': 'en_mantenimiento',
    'en_mantenimiento': 'en_mantenimiento',
    'fuera_de_servicio': 'fuera_de_servicio',
    'dado_de_baja': 'dado_de_baja',
  };
  return map[raw.trim().toLowerCase()] || 'operativo';
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

  const searchResult = await fetchWithAuth<{ data: Array<{ id: string }> }>(
    `/v1/empresas/${empresaId}/catalogo/articulos?search=${encodeURIComponent(data.nombre)}&limit=1`,
  );

  let articuloId: string;
  if (searchResult.data?.length > 0) {
    articuloId = searchResult.data[0].id;
  } else {
    const created = await fetchWithAuth<{ data: { id: string } }>(
      `/v1/empresas/${empresaId}/catalogo/articulos`,
      {
        method: 'POST',
        contentType: 'json-api',
        json: {
          data: {
            type: 'catalog-articles',
            attributes: {
              name: data.nombre,
              manufacturer: data.marca || null,
              model: data.nombre,
            },
          },
        },
      },
    );
    articuloId = created.data.id;
  }

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

  await fetchWithAuth(`/v1/empresas/${empresaId}/activos/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'assets', attributes: attrs } },
  });
}

import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { buildOffsetQuery } from '@/lib/pagination';
import { extractResourceList, extractResource, getAttr, type JsonApiResource } from '@/lib/jsonapi';

export interface ArticuloCatalogo {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  manufacturer: string | null;
  model: string | null;
  unit_of_measure: string | null;
}

export interface ArticulosQuery {
  page?: number;
  perPage?: number;
  category_id?: string;
  search?: string;
}

function mapArticulo(resource: JsonApiResource): ArticuloCatalogo {
  return {
    id: resource.id,
    name: getAttr(resource, 'name'),
    category_id: getAttr(resource, 'category_id') || null,
    description: getAttr(resource, 'description') || null,
    manufacturer: getAttr(resource, 'manufacturer') || null,
    model: getAttr(resource, 'model') || null,
    unit_of_measure: getAttr(resource, 'unit_of_measure') || null,
  };
}

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/catalogo/articulos`;
}

export async function getArticulos(params: ArticulosQuery = {}): Promise<ArticuloCatalogo[]> {
  const url = await baseUrl();
  const query = buildOffsetQuery({
    page: params.page ?? 1,
    perPage: params.perPage ?? 50,
    category_id: params.category_id,
    search: params.search,
  });
  const payload = await fetchWithAuth<unknown>(`${url}${query}`);
  return extractResourceList(payload).map(mapArticulo);
}

export async function getArticulo(id: string): Promise<ArticuloCatalogo> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el articulo.');
  return mapArticulo(resource);
}

export async function createArticulo(input: {
  name: string;
  manufacturer?: string;
  model?: string;
  category_id?: string;
  description?: string;
  unit_of_measure?: string;
}): Promise<ArticuloCatalogo> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'catalog-articles',
        attributes: {
          name: input.name,
          manufacturer: input.manufacturer ?? null,
          model: input.model ?? null,
          category_id: input.category_id ?? null,
          description: input.description ?? null,
          unit_of_measure: input.unit_of_measure ?? null,
        },
      },
    },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el articulo creado.');
  return mapArticulo(resource);
}

export async function updateArticulo(id: string, input: Partial<{
  name: string;
  manufacturer: string | null;
  model: string | null;
  category_id: string | null;
  description: string | null;
  unit_of_measure: string | null;
}>): Promise<ArticuloCatalogo> {
  const url = await baseUrl();
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) attributes[key] = value;
  }
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'catalog-articles', attributes } },
  });
  const resource = extractResource(payload);
  if (!resource) throw new Error('No se pudo interpretar el articulo actualizado.');
  return mapArticulo(resource);
}

export async function deleteArticulo(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}
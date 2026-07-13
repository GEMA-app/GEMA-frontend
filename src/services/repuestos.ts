import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import type {
  ActualizarRepuestoInput,
  DropdownOption,
  NuevoRepuestoInput,
  Repuesto,
  RepuestosQuery,
  RepuestosResponse,
} from '@/types/repuesto';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/inventario`;
}

async function catalogoUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/catalogo/articulos`;
}

async function proveedoresUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/proveedores`;
}

function buildRepuestosQuery(params: RepuestosQuery): string {
  const searchParams = new URLSearchParams();
  const page = params.page ?? 1;
  const limit = params.perPage ?? 15;
  const offset = (page - 1) * limit;

  searchParams.set('offset', String(offset));
  searchParams.set('limit', String(limit));

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  return `?${searchParams.toString()}`;
}

function mapRepuestoFromApi(item: unknown): Repuesto | null {
  const record = item as Record<string, unknown> | null;
  if (!record?.id) return null;

  const attrs = (record.attributes ?? record) as Record<string, unknown>;

  return {
    id: String(record.id),
    articuloId: String(attrs.articulo_id ?? ''),
    proveedorId: String(attrs.proveedor_id ?? ''),
    stockActual: Number(attrs.stock_actual ?? 0),
    stockMinimo: Number(attrs.stock_minimo ?? 0),
    ubicacion: String(attrs.ubicacion_almacen ?? ''),
    precioUnitario: String(attrs.precio_unitario ?? '0.00'),
    moneda: String(attrs.moneda ?? 'USD'),
    version: Number(attrs.version ?? 1),
  };
}

function extractMeta(payload: unknown, page: number, perPage: number): RepuestosResponse['meta'] {
  const record = payload as Record<string, unknown> | null;
  const data = (record?.data ?? []) as unknown[];
  const repuestos = data.map(mapRepuestoFromApi).filter((r): r is Repuesto => r !== null);

  return {
    page,
    perPage,
    total: repuestos.length,
    lastPage: Math.max(1, Math.ceil(repuestos.length / perPage)),
  };
}

export async function getRepuestos(params: RepuestosQuery = {}): Promise<RepuestosResponse> {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const query = buildRepuestosQuery({ ...params, page, perPage });
  const base = await baseUrl();

  const payload = await fetchWithAuth<unknown>(`${base}${query}`);
  const record = payload as Record<string, unknown> | null;
  const data = (record?.data ?? []) as unknown[];
  const repuestos = data.map(mapRepuestoFromApi).filter((r): r is Repuesto => r !== null);
  const meta = extractMeta(payload, page, perPage);

  return { repuestos, meta: { ...meta, total: repuestos.length } };
}

export async function createRepuesto(input: NuevoRepuestoInput): Promise<Repuesto> {
  const base = await baseUrl();
  const payload = await fetchWithAuth<unknown>(base, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'inventory_parts',
        attributes: {
          articulo_id: input.articuloId,
          proveedor_id: input.proveedorId,
          stock_actual: input.stockActual ?? 0,
          stock_minimo: input.stockMinimo ?? 0,
          ubicacion_almacen: input.ubicacion,
          precio_unitario: input.precioUnitario ?? '0.00',
          moneda: input.moneda ?? 'USD',
        },
      },
    },
  });

  const repuesto = mapRepuestoFromApi(payload);
  if (!repuesto) throw new Error('No se pudo interpretar la respuesta del repuesto creado.');
  return repuesto;
}

export async function getRepuestoById(id: string): Promise<Repuesto> {
  const base = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${base}/${id}`);
  const repuesto = mapRepuestoFromApi(payload);

  if (!repuesto) throw new Error('No se pudo interpretar la respuesta del repuesto.');
  return repuesto;
}

export async function updateRepuesto(id: string, input: ActualizarRepuestoInput): Promise<Repuesto> {
  const base = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${base}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: {
      data: {
        type: 'inventory_parts',
        attributes: {
          proveedor_id: input.proveedorId,
          stock_minimo: input.stockMinimo,
          ubicacion_almacen: input.ubicacion,
          precio_unitario: input.precioUnitario,
          moneda: input.moneda,
          version: input.version,
        },
      },
    },
  });

  const repuesto = mapRepuestoFromApi(payload);
  if (!repuesto) throw new Error('No se pudo interpretar la respuesta del repuesto actualizado.');
  return repuesto;
}

export async function deleteRepuesto(id: string): Promise<void> {
  const base = await baseUrl();
  await fetchWithAuth(`${base}/${id}`, { method: 'DELETE' });
}

function mapDropdownItem(item: unknown): DropdownOption | null {
  const record = item as Record<string, unknown> | null;
  if (!record?.id) return null;
  const attrs = (record.attributes ?? record) as Record<string, unknown>;
  return { id: String(record.id), nombre: String(attrs.name ?? attrs.nombre ?? '') };
}

export async function getArticulos(): Promise<DropdownOption[]> {
  const base = await catalogoUrl();
  const payload = await fetchWithAuth<unknown>(`${base}?limit=100`);
  const data = ((payload as Record<string, unknown>)?.data ?? []) as unknown[];
  return data.map(mapDropdownItem).filter((r): r is DropdownOption => r !== null);
}

export async function getProveedores(): Promise<DropdownOption[]> {
  const base = await proveedoresUrl();
  const payload = await fetchWithAuth<unknown>(`${base}`);
  const data = ((payload as Record<string, unknown>)?.data ?? []) as unknown[];
  return data.map(mapDropdownItem).filter((r): r is DropdownOption => r !== null);
}

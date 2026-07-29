import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { buildOffsetQuery } from '@/lib/pagination';
import {
  extractMovimientosFromResponse,
  extractMovimientosMeta,
  extractRepuestosFromResponse,
  extractRepuestosMeta,
  mapRepuestoFromResponse,
} from '@/lib/repuestos';
import type {
  ActualizarRepuestoInput,
  MovimientoInventario,
  MovimientosResponse,
  NuevoMovimientoInput,
  NuevoRepuestoInput,
  Repuesto,
  RepuestosQuery,
  RepuestosResponse,
} from '@/types/repuesto';

async function baseUrl(): Promise<string> {
  const empresaId = await requireEmpresaId();
  return `/v1/empresas/${empresaId}/inventario`;
}

export async function getRepuestos(params: RepuestosQuery = {}): Promise<RepuestosResponse> {
  const url = await baseUrl();
  const page = params.page ?? 1;
  const perPage = Math.min(params.perPage ?? 15, 100);
  const query = buildOffsetQuery({
    page,
    perPage,
    proveedor_id: params.proveedorId,
  });
  const payload = await fetchWithAuth<unknown>(`${url}${query}`);
  return {
    repuestos: extractRepuestosFromResponse(payload),
    meta: extractRepuestosMeta(payload, page, perPage),
  };
}

export async function getRepuestoById(id: string): Promise<Repuesto> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`);
  const repuesto = mapRepuestoFromResponse(payload);
  if (!repuesto) throw new Error('No se pudo interpretar el repuesto.');
  return repuesto;
}

export async function createRepuesto(input: NuevoRepuestoInput): Promise<Repuesto> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(url, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'inventory_parts',
        attributes: {
          articulo_id: input.articulo_id,
          proveedor_id: input.proveedor_id,
          ubicacion_almacen: input.ubicacion_almacen,
          stock_actual: input.stock_actual ?? 0,
          stock_minimo: input.stock_minimo ?? 0,
          precio_unitario: input.precio_unitario ?? 0,
          moneda: input.moneda ?? 'USD',
        },
      },
    },
  });
  const repuesto = mapRepuestoFromResponse(payload);
  if (!repuesto) throw new Error('No se pudo interpretar el repuesto creado.');
  return repuesto;
}

export async function updateRepuesto(id: string, input: ActualizarRepuestoInput): Promise<Repuesto> {
  const url = await baseUrl();
  const { version, ...rest } = input;
  const attributes: Record<string, unknown> = { version };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) attributes[key] = value;
  }
  const payload = await fetchWithAuth<unknown>(`${url}/${id}`, {
    method: 'PATCH',
    contentType: 'json-api',
    json: { data: { type: 'inventory_parts', attributes } },
  });
  const repuesto = mapRepuestoFromResponse(payload);
  if (!repuesto) throw new Error('No se pudo interpretar el repuesto actualizado.');
  return repuesto;
}

export async function deleteRepuesto(id: string): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${id}`, { method: 'DELETE' });
}

export async function getMovimientos(repuestoId: string, page = 1, perPage = 20): Promise<MovimientosResponse> {
  const url = await baseUrl();
  const payload = await fetchWithAuth<unknown>(
    `${url}/${repuestoId}/movimientos${buildOffsetQuery({ page, perPage })}`,
  );
  return {
    movimientos: extractMovimientosFromResponse(payload),
    meta: extractMovimientosMeta(payload, page, perPage),
  };
}

export async function createMovimiento(repuestoId: string, input: NuevoMovimientoInput): Promise<void> {
  const url = await baseUrl();
  await fetchWithAuth(`${url}/${repuestoId}/movimientos`, {
    method: 'POST',
    contentType: 'json-api',
    json: {
      data: {
        type: 'inventory_entries',
        attributes: {
          movement_type: input.movement_type,
          quantity: input.quantity,
          work_order_id: input.work_order_id ?? null,
          reason: input.reason ?? null,
        },
      },
    },
  });
}
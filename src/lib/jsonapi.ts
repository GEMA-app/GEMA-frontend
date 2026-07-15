/**
 * Helpers compartidos para parsear respuestas JSON:API.
 * Todos los modulos nuevos DEBEN importar desde aqui en vez de duplicar.
 *
 * Consolidado desde: lib/usuarios.ts, lib/reportes.ts, lib/historial.ts
 */

export type JsonApiResource = {
  id: string;
  type?: string;
  attributes: Record<string, unknown>;
};

export type JsonApiResponse = {
  data?: unknown;
  meta?: Record<string, unknown>;
  [key: string]: unknown;
};

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

export function extractResource(payload: unknown): JsonApiResource | null {
  const record = asRecord(payload);
  if (!record) return null;

  const data = asRecord(record.data);
  const resource = data ?? record;

  if (!resource?.id) return null;

  const attrs = asRecord(resource.attributes) ?? {};
  return { id: String(resource.id), attributes: attrs };
}

export function extractResourceList(
  payload: unknown,
): Array<JsonApiResource> {
  if (Array.isArray(payload)) {
    return payload.map(toResource).filter((r): r is JsonApiResource => r !== null);
  }

  const record = asRecord(payload);
  if (!record) return [];

  const data = record.data;
  if (Array.isArray(data)) {
    return data.map(toResource).filter((r): r is JsonApiResource => r !== null);
  }

  return [];
}

function toResource(item: unknown): JsonApiResource | null {
  const record = asRecord(item);
  if (!record?.id) return null;
  const attrs = asRecord(record.attributes) ?? {};
  return { id: String(record.id), attributes: attrs };
}

export function getAttr(resource: JsonApiResource, key: string, fallback = ''): string {
  const value = resource.attributes[key];
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

export function getAttrNumber(resource: JsonApiResource, key: string, fallback = 0): number {
  const value = resource.attributes[key];
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function getAttrBoolean(resource: JsonApiResource, key: string, fallback = false): boolean {
  const value = resource.attributes[key];
  if (typeof value === 'boolean') return value;
  return fallback;
}

import type { HistorialEntry } from '@/types/historial';
import { asRecord } from '@/lib/jsonapi';

type ApiRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function asRecordValue(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return null;
}

export function mapApiHistorialToUi(raw: unknown): HistorialEntry | null {
  const record = asRecord(raw);
  if (!record) return null;

  const attributes = asRecord(record.attributes) ?? record;

  const id = asString(record.id) || asString(attributes.id);
  const fecha =
    asString(attributes.ocurrido_en) ||
    asString(attributes.fecha) ||
    asString(attributes.created_at) ||
    new Date().toISOString();

  if (!id) return null;

  const rawModulo = asString(attributes.modulo) || asString(attributes.resource_type) || 'sistema';

  const moduloLower = rawModulo.toLowerCase();
  let modulo = 'sistema';
  if (moduloLower.includes('activo')) modulo = 'activos';
  else if (moduloLower.includes('mantenimiento') || moduloLower.includes('orden')) modulo = 'mantenimiento';
  else if (moduloLower.includes('inventario') || moduloLower.includes('repuesto') || moduloLower.includes('articulo')) modulo = 'inventario';
  else if (moduloLower.includes('usuario') || moduloLower.includes('auth') || moduloLower.includes('sesion')) modulo = 'usuarios';

  const detallesObj = asRecordValue(attributes.detalles) ?? {};
  const detallesSummary = Object.keys(detallesObj).length > 0
    ? Object.entries(detallesObj).map(([k, v]) => `${k}: ${v}`).join(', ')
    : '';

  const descripcion =
    asString(attributes.descripcion) ||
    asString(attributes.mensaje) ||
    detallesSummary ||
    asString(attributes.accion, '—');

  const usuarioNombre =
    asString(attributes.usuario_nombre) ||
    asString(attributes.usuario) ||
    asString(attributes.usuario_id, 'Sistema');

  return {
    id,
    usuario: {
      nombre: usuarioNombre,
      email: asString(attributes.usuario_email, undefined) || undefined,
    },
    accion: asString(attributes.accion, '—'),
    modulo,
    descripcion,
    detalles: detallesObj,
    fecha,
    ip: asString(attributes.ip_address) || asString(attributes.ip, undefined) || undefined,
  };
}

export function extractHistorialFromResponse(payload: unknown): HistorialEntry[] {
  if (Array.isArray(payload)) {
    return payload.map(mapApiHistorialToUi).filter((item): item is HistorialEntry => item !== null);
  }

  const record = asRecord(payload);
  if (!record) return [];

  const data = record.data;
  if (Array.isArray(data)) {
    return data.map(mapApiHistorialToUi).filter((item): item is HistorialEntry => item !== null);
  }

  const auditoria = record.auditoria;
  if (Array.isArray(auditoria)) {
    return auditoria.map(mapApiHistorialToUi).filter((item): item is HistorialEntry => item !== null);
  }

  return [];
}

export interface HistorialMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
  hasMore: boolean;
}

export function extractHistorialMeta(payload: unknown, fallbackPage: number, fallbackLimit: number): HistorialMeta {
  const record = asRecord(payload);
  const meta = asRecord(record?.meta) ?? asRecord(record?.pagination);

  const page = Number(meta?.page ?? meta?.current_page ?? fallbackPage);
  const limit = Number(meta?.limit ?? meta?.per_page ?? fallbackLimit);
  const total = Number(meta?.total ?? meta?.total_count ?? 0);
  const calculatedLastPage = Math.max(1, Math.ceil(total / (limit || 20)));
  const lastPage = Number(meta?.last_page ?? meta?.lastPage ?? calculatedLastPage);
  const hasMore =
    typeof meta?.has_more === 'boolean'
      ? meta.has_more
      : typeof meta?.hasMore === 'boolean'
        ? meta.hasMore
        : lastPage > 0
          ? page < lastPage
          : page * limit < total;

  return { page, limit, total, lastPage, hasMore };
}

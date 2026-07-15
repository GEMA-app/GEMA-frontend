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

  const id = asString(record.id);
  const fecha = asString(attributes.ocurrido_en);

  if (!id || !fecha) return null;

  return {
    id,
    usuario: {
      nombre: asString(attributes.usuario_id, '—'),
    },
    accion: asString(attributes.accion, '—'),
    detalles: asRecordValue(attributes.detalles) ?? {},
    fecha,
    ip: asString(attributes.ip_address, undefined) || undefined,
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
  hasMore: boolean;
}

export function extractHistorialMeta(payload: unknown, fallbackPage: number, fallbackLimit: number): HistorialMeta {
  const record = asRecord(payload);
  const meta = asRecord(record?.meta) ?? asRecord(record?.pagination);

  const page = Number(meta?.page ?? meta?.current_page ?? fallbackPage);
  const limit = Number(meta?.limit ?? meta?.per_page ?? fallbackLimit);
  const total = Number(meta?.total ?? meta?.total_count ?? 0);
  const lastPage = Number(meta?.last_page ?? 0);
  const hasMore =
    typeof meta?.has_more === 'boolean'
      ? meta.has_more
      : typeof meta?.hasMore === 'boolean'
        ? meta.hasMore
        : lastPage > 0
          ? page < lastPage
          : page * limit < total;

  return { page, limit, total, hasMore };
}

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

  // Intentar resolver el nombre real del usuario desde varios campos posibles.
  // El backend puede incluirlo directamente en el registro de auditoría o solo
  // devolver el UUID en usuario_id.
  const usuarioObj = asRecordValue(attributes.usuario);
  const nombreResuelto =
    asString(usuarioObj?.nombre ?? usuarioObj?.name, '') ||
    asString(attributes.usuario_nombre, '') ||
    asString(attributes.usuario_name, '') ||
    asString(attributes.nombre_usuario, '') ||
    asString(attributes.user_name, '') ||
    asString(attributes.usuario_id, '—');

  const emailResuelto =
    asString(usuarioObj?.email, '') ||
    asString(attributes.usuario_email, '') ||
    undefined;

  return {
    id,
    usuario: {
      nombre: nombreResuelto,
      ...(emailResuelto ? { email: emailResuelto } : {}),
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
  const total = Number(meta?.total ?? meta?.total_count ?? meta?.count ?? meta?.total_items ?? 0);
  const lastPage = Number(meta?.last_page ?? meta?.total_pages ?? meta?.pages ?? 0);
  const hasMore =
    typeof meta?.has_more === 'boolean'
      ? meta.has_more
      : typeof meta?.hasMore === 'boolean'
        ? meta.hasMore
        : lastPage > 0
          ? page < lastPage
          : total > 0
            ? page * limit < total
            : false;

  return { page, limit, total, hasMore };
}

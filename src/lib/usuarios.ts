import type { Usuario, UsuariosMeta, UsuarioDetalle } from '@/types/usuario';
import { buildPermisosFromRol, rolSlugFromLabel } from '@/lib/permisos';

const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador',
  administrador: 'Administrador',
  tecnico: 'Técnico',
  técnico: 'Técnico',
  supervisor: 'Supervisor',
  reporter: 'Reporter',
};

export function getIniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatRol(rol: string): string {
  const normalized = rol.trim().toLowerCase();
  return ROL_LABELS[normalized] ?? rol;
}

export function formatEstado(estado: string): string {
  const normalized = estado.trim().toLowerCase();
  if (normalized === 'activo' || normalized === 'true') return 'Activo';
  if (normalized === 'inactivo' || normalized === 'false') return 'Inactivo';
  if (normalized === 'suspendido') return 'Suspendido';
  return estado;
}

function padCodigo(id: string): string {
  return String(id).padStart(6, '0');
}

function formatFechaDetalle(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatUltimoAcceso(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  const time = date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Hoy, ${time}`;
  if (isYesterday) return `Ayer, ${time}`;
  return `${formatFechaDetalle(value)}, ${time}`;
}

type JsonApiResource = {
  id: string;
  type?: string;
  attributes?: Record<string, unknown>;
};

function asRecord(val: unknown): Record<string, unknown> | null {
  return val && typeof val === 'object' ? (val as Record<string, unknown>) : null;
}

function extractResource(payload: unknown): { id: string; attributes: Record<string, unknown> } | null {
  const record = asRecord(payload);
  if (!record) return null;
  const data = record.data;
  const resource = asRecord(data);
  if (!resource?.id) return null;
  const attrs = asRecord(resource.attributes) ?? {};
  return { id: String(resource.id), attributes: attrs };
}

function extractResourceList(payload: unknown): Array<{ id: string; attributes: Record<string, unknown> }> {
  const record = asRecord(payload);
  if (!record) return [];
  const data = record.data;
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      const resource = asRecord(item);
      if (!resource?.id) return null;
      const attrs = asRecord(resource.attributes) ?? {};
      return { id: String(resource.id), attributes: attrs };
    })
    .filter((r): r is { id: string; attributes: Record<string, unknown> } => r !== null);
}

export function mapUsuarioDetalleFromApi(payload: unknown): UsuarioDetalle | null {
  const resource = extractResource(payload);
  if (!resource) return null;

  const attrs = resource.attributes;
  const nombre = String(attrs.nombre ?? '');
  const roles: string[] = Array.isArray(attrs.roles) ? attrs.roles.map(String) : [];
  const rolRaw = roles.length > 0 ? roles[0] : 'sin rol';
  const rolSlug = rolSlugFromLabel(rolRaw);

  return {
    id: resource.id,
    iniciales: getIniciales(nombre),
    nombre: nombre.toUpperCase(),
    codigo: padCodigo(resource.id),
    sede: 'N/A',
    email: String(attrs.email ?? ''),
    activo: attrs.activo === true,
    rol: formatRol(rolRaw).toUpperCase(),
    rolSlug,
    cargo: formatRol(rolRaw),
    fechaIngreso: formatFechaDetalle(String(attrs.created_at ?? '')),
    ultimoAcceso: formatUltimoAcceso(String(attrs.updated_at ?? attrs.created_at ?? '')),
    permisos: buildPermisosFromRol(rolSlug),
  };
}

export function mapUsuarioFromApi(resource: { id: string; attributes: Record<string, unknown> }): Usuario {
  const attrs = resource.attributes;
  const nombre = String(attrs.nombre ?? '');
  const roles: string[] = Array.isArray(attrs.roles) ? attrs.roles.map(String) : [];
  const rolRaw = roles.length > 0 ? roles[0] : 'Sin rol';

  return {
    id: resource.id,
    iniciales: getIniciales(nombre),
    nombre,
    email: String(attrs.email ?? ''),
    rol: formatRol(rolRaw),
    departamento: 'N/A',
    activo: attrs.activo === true,
  };
}

export function extractUsuariosMeta(
  payload: unknown,
  page: number,
  perPage: number,
): UsuariosMeta {
  if (!payload || typeof payload !== 'object') {
    return { page, perPage, total: 0, lastPage: 1 };
  }

  const record = payload as Record<string, unknown>;
  const meta = record.meta as Record<string, unknown> | undefined;
  const data = record.data;

  const total =
    (typeof meta?.total === 'number' && meta.total) ||
    (Array.isArray(data) ? data.length : 0);

  const lastPage = Math.max(1, Math.ceil(total / perPage));

  return { page, perPage, total, lastPage };
}

export function extractUsuariosFromResponse(payload: unknown): Usuario[] {
  return extractResourceList(payload).map(mapUsuarioFromApi);
}

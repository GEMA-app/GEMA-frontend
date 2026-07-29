import type { Usuario } from '@/types/usuario';
import { extractResource, extractResourceList, getAttr, getAttrBoolean } from '@/lib/jsonapi';

// Legacy utils for configuracion/usuarios (mock-based)
const ROL_LABELS: Record<string, string> = {
  admin: 'Administrador', administrador: 'Administrador',
  tecnico: 'Técnico', técnico: 'Técnico',
  supervisor: 'Supervisor', reporter: 'Reporter',
};

export function formatRol(rol: string): string {
  return ROL_LABELS[rol.trim().toLowerCase()] ?? rol;
}

export function getIniciales(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatEstado(estado: string): string {
  const n = estado.trim().toLowerCase();
  if (n === 'activo') return 'Activo';
  if (n === 'inactivo') return 'Inactivo';
  if (n === 'suspendido') return 'Suspendido';
  return estado;
}

export function mapUsuarioFromResource(raw: unknown): Usuario | null {
  const resource = extractResource(raw);
  if (!resource) return null;
  return {
    id: resource.id,
    nombre: getAttr(resource, 'nombre'),
    email: getAttr(resource, 'email'),
    telefono: getAttr(resource, 'telefono') || null,
    activo: getAttrBoolean(resource, 'activo', true),
    roles: Array.isArray(resource.attributes.roles)
      ? (resource.attributes.roles as string[])
      : [],
    created_at: getAttr(resource, 'created_at'),
    updated_at: getAttr(resource, 'updated_at'),
  };
}

export function extractUsuariosFromResponse(payload: unknown): Usuario[] {
  return extractResourceList(payload)
    .map(mapUsuarioFromResource)
    .filter((u): u is Usuario => u !== null);
}

export function extractUsuariosMeta(payload: unknown, fallbackOffset = 0, fallbackLimit = 15): { total: number; offset: number; limit: number } {
  if (!payload || typeof payload !== 'object') return { total: 0, offset: fallbackOffset, limit: fallbackLimit };
  const record = payload as Record<string, unknown>;
  const meta = record.meta as Record<string, unknown> | undefined;
  return {
    total: typeof meta?.total === 'number' ? meta.total : 0,
    offset: typeof meta?.offset === 'number' ? meta.offset : fallbackOffset,
    limit: typeof meta?.limit === 'number' ? meta.limit : fallbackLimit,
  };
}

import type { ModuloRBAC, AccionRBAC } from '@/lib/permisos';

export interface PermisoGranular {
  modulo: ModuloRBAC;
  acciones: AccionRBAC[];
}

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  permisos: PermisoGranular[];
  version: number;
}

export interface NuevoRolInput {
  nombre: string;
  descripcion?: string;
  permisos: PermisoGranular[];
}

export interface ActualizarRolInput {
  nombre?: string;
  descripcion?: string;
  permisos?: PermisoGranular[];
  version: number;
}

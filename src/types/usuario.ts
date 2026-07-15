// --- Backend JSON:API types (nuevo modulo) ---

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  roles: string[];
  created_at: string;
  updated_at: string;
}

export interface UsuariosMeta {
  total: number;
  offset: number;
  limit: number;
}

export interface NuevoUsuarioInput {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export type UsuarioEstado = 'activo' | 'inactivo' | 'suspendido';

export interface ActualizarUsuarioInput {
  nombre?: string;
  email?: string;
  telefono?: string;
  activo?: boolean;
}

// --- Legacy types (mock-based configuracion/usuarios) ---

export interface LegacyActualizarUsuarioInput {
  nombre: string;
  email: string;
  rol: string;
  estado: UsuarioEstado;
  cargo?: string;
}

export interface UsuarioPermiso {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface UsuarioDetalle {
  id: string;
  iniciales: string;
  nombre: string;
  codigo: string;
  sede: string;
  email: string;
  rol: string;
  rolSlug: string;
  cargo: string;
  fechaIngreso: string;
  ultimoAcceso: string;
  permisos: UsuarioPermiso[];
}

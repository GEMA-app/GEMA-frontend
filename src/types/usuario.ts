export type UsuarioEstado = 'activo' | 'inactivo' | 'suspendido';

export interface Usuario {
  id: string;
  iniciales: string;
  nombre: string;
  email: string;
  rol: string;
  departamento: string;
  activo: boolean;
}

export interface UsuariosMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface NuevoUsuarioInput {
  nombre: string;
  email: string;
  password: string;
  rol: string;
  estado: UsuarioEstado;
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

export interface ActualizarUsuarioInput {
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  cargo?: string;
}

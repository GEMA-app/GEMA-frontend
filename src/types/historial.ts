export type RolUsuario = 'Administrador' | 'Supervisor' | 'Técnico';

export interface HistorialEntry {
  id: string;
  usuario: {
    nombre: string;
    rol: RolUsuario;
  };
  accion: string;
  descripcion: string;
  fecha: string;
  metadata?: {
    ip?: string;
    terminal?: string;
  };
}

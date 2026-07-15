export type RolUsuario = string;

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

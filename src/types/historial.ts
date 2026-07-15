export type RolUsuario = string;

export interface HistorialEntry {
  id: string;
  usuario: {
    nombre: string;
    email?: string;
    roles?: string[];
  };
  accion: string;
  detalles: Record<string, unknown>;
  fecha: string;
  ip?: string;
}

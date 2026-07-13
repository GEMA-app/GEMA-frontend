export interface HistorialEntry {
  id: string;
  usuario: {
    nombre: string;
    rol: string;
  };
  accion: string;
  descripcion: string;
  fecha: string;
  metadata?: {
    ip?: string;
    terminal?: string;
  };
}

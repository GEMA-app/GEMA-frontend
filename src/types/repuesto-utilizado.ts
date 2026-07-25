export interface RepuestoUtilizado {
  id: string;
  intervencion_id: string;
  repuesto_id: string;
  cantidad_usada: number;
  precio_unitario: number | null;
  moneda: string;
  precio_total: number | null;
  created_at: string | null;
}

export interface NuevoRepuestoUtilizadoInput {
  repuesto_id: string;
  cantidad_usada: number;
  precio_unitario?: number;
  moneda?: string;
}
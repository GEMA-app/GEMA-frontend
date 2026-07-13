export type ProcesoUbicacion = 'alta' | 'media' | 'baja';
export type EstadoUbicacion = 'completado' | 'en_progreso' | 'pendiente';

export interface Ubicacion {
  id: string;
  nombre: string;
  jerarquia: string;
  tipo: string;
  proceso: ProcesoUbicacion;
  estado: EstadoUbicacion;
  parentId?: string;
  hijos?: Ubicacion[];
}

export interface NuevaUbicacionForm {
  nombre: string;
  jerarquia: string;
  tipo: string;
  proceso: ProcesoUbicacion;
  estado: EstadoUbicacion;
  parentId?: string;
}

export interface DropdownOption {
  id: string;
  nombre: string;
}

export interface Repuesto {
  id: string;
  articuloId: string;
  proveedorId: string;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  precioUnitario: string;
  moneda: string;
  version: number;
}

export interface RepuestosMeta {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface RepuestosQuery {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface RepuestosResponse {
  repuestos: Repuesto[];
  meta: RepuestosMeta;
}

export interface NuevoRepuestoInput {
  articuloId: string;
  proveedorId: string;
  stockActual?: number;
  stockMinimo?: number;
  ubicacion: string;
  precioUnitario?: string;
  moneda?: string;
}

export interface ActualizarRepuestoInput {
  proveedorId?: string;
  stockMinimo?: number;
  ubicacion?: string;
  precioUnitario?: string;
  moneda?: string;
  version: number;
}

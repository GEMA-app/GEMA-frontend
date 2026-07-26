export interface Proveedor {
  id: string;
  name: string;
  rif: string | null;
  phone: string | null;
  email: string | null;
  contact: string | null;
  version: number;
}

export interface ProveedorDetalle extends Proveedor {
  empresa_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProveedoresQuery {
  search?: string;
}

export interface ProveedoresResponse {
  proveedores: Proveedor[];
}

export interface CreateProveedorForm {
  name: string;
  rif?: string;
  phone?: string;
  email?: string;
  contact?: string;
}

export interface UpdateProveedorForm {
  name?: string;
  rif?: string;
  phone?: string;
  email?: string;
  contact?: string;
  version: number;
}

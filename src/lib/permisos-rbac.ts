/** Módulos del sistema (1:1 con PermissionModule del backend) */
export const MODULOS_RBAC = {
  ACTIVOS: 'activos',
  MANTENIMIENTO: 'mantenimiento',
  INVENTARIO: 'inventario',
  REPORTES: 'reportes',
  ADMINISTRACION: 'administracion',
  PREFERENCIAS: 'preferencias',
} as const;

export const ACCIONES_RBAC = ['view', 'create', 'edit', 'delete'] as const;

export type ModuloRBAC = (typeof MODULOS_RBAC)[keyof typeof MODULOS_RBAC];
export type AccionRBAC = (typeof ACCIONES_RBAC)[number];

type PermisoMatrix = Record<string, boolean>;

/** Matriz de permisos por rol (alineada con seeds del backend Role.create_default_roles) */
export const MATRIZ_RBAC: Record<string, Record<ModuloRBAC, Record<AccionRBAC, boolean>>> = {
  admin: {
    activos: { view: true, create: true, edit: true, delete: true },
    mantenimiento: { view: true, create: true, edit: true, delete: true },
    inventario: { view: true, create: true, edit: true, delete: true },
    reportes: { view: true, create: true, edit: true, delete: true },
    administracion: { view: true, create: true, edit: true, delete: true },
    preferencias: { view: true, create: true, edit: true, delete: true },
  },
  'supervisor-activos': {
    activos: { view: true, create: true, edit: true, delete: true },
    mantenimiento: { view: true, create: false, edit: false, delete: false },
    inventario: { view: true, create: false, edit: false, delete: false },
    reportes: { view: true, create: false, edit: false, delete: false },
    administracion: { view: false, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
  'supervisor-operaciones': {
    activos: { view: true, create: false, edit: false, delete: false },
    mantenimiento: { view: true, create: true, edit: true, delete: true },
    inventario: { view: true, create: true, edit: true, delete: true },
    reportes: { view: true, create: true, edit: true, delete: true },
    administracion: { view: true, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
  supervisor: {
    activos: { view: true, create: false, edit: false, delete: false },
    mantenimiento: { view: true, create: true, edit: true, delete: true },
    inventario: { view: true, create: true, edit: true, delete: true },
    reportes: { view: true, create: true, edit: true, delete: true },
    administracion: { view: true, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
  tecnico: {
    activos: { view: true, create: false, edit: false, delete: false },
    mantenimiento: { view: true, create: true, edit: true, delete: false },
    inventario: { view: true, create: false, edit: false, delete: false },
    reportes: { view: true, create: true, edit: false, delete: false },
    administracion: { view: false, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
  almacenista: {
    activos: { view: true, create: false, edit: false, delete: false },
    mantenimiento: { view: false, create: false, edit: false, delete: false },
    inventario: { view: true, create: true, edit: true, delete: true },
    reportes: { view: true, create: false, edit: false, delete: false },
    administracion: { view: false, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
  consultor: {
    activos: { view: true, create: false, edit: false, delete: false },
    mantenimiento: { view: true, create: false, edit: false, delete: false },
    inventario: { view: true, create: false, edit: false, delete: false },
    reportes: { view: true, create: false, edit: false, delete: false },
    administracion: { view: true, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
  reporter: {
    activos: { view: true, create: false, edit: false, delete: false },
    mantenimiento: { view: true, create: false, edit: false, delete: false },
    inventario: { view: true, create: false, edit: false, delete: false },
    reportes: { view: true, create: false, edit: false, delete: false },
    administracion: { view: false, create: false, edit: false, delete: false },
    preferencias: { view: true, create: false, edit: true, delete: false },
  },
};

const ROLE_SLUG_EXACT_MAP: Record<string, string> = {
  administrador: 'admin',
  admin: 'admin',
  'supervisor de activos': 'supervisor-activos',
  'supervisor de operaciones': 'supervisor-operaciones',
  supervisor: 'supervisor-operaciones',
  'técnico de mantenimiento': 'tecnico',
  'tecnico de mantenimiento': 'tecnico',
  técnico: 'tecnico',
  tecnico: 'tecnico',
  almacenista: 'almacenista',
  'consultor (solo lectura)': 'consultor',
  consultor: 'consultor',
  reporter: 'reporter',
};

export function rolSlugFromLabel(rol: string): string {
  const normalized = rol.trim().toLowerCase();
  if (ROLE_SLUG_EXACT_MAP[normalized]) return ROLE_SLUG_EXACT_MAP[normalized];
  if (normalized.includes('supervisor de activos')) return 'supervisor-activos';
  if (normalized.includes('supervisor de operaciones')) return 'supervisor-operaciones';
  if (normalized.includes('almacenista')) return 'almacenista';
  if (normalized.includes('consultor')) return 'consultor';
  if (normalized.includes('técnico') || normalized.includes('tecnico')) return 'tecnico';
  if (normalized.includes('reporter')) return 'reporter';
  return normalized === 'administrador' || normalized === 'admin' ? 'admin' : 'consultor';
}

function buildAccionesPorRol(rol: string): PermisoMatrix {
  const matrix: PermisoMatrix = {};
  const slug = rolSlugFromLabel(rol);
  const permisosRol = MATRIZ_RBAC[slug] || MATRIZ_RBAC['consultor'];

  for (const m of Object.values(MODULOS_RBAC)) {
    for (const a of ACCIONES_RBAC) {
      matrix[`${m}:${a}`] = permisosRol[m]?.[a] ?? false;
    }
  }

  return matrix;
}

export function hasPermisoAccion(rol: string, modulo: ModuloRBAC, accion: AccionRBAC = 'view'): boolean {
  const matrix = buildAccionesPorRol(rol);
  return matrix[`${modulo}:${accion}`] ?? false;
}

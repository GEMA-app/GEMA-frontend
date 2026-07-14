# AGENTS.md — GEMA Frontend

> Documento de contexto para agentes de IA que trabajen con este repositorio.

---

## Identidad del Proyecto

- **Nombre**: GEMA Frontend
- **Descripción**: Interfaz web del sistema GEMA de UNEGIA — gestión de mantenimiento y activos industriales.
- **Framework**: Next.js (App Router)
- **Lenguaje**: TypeScript (strict mode)
- **Estilos**: Tailwind CSS
- **Estado**: React hooks con `useState`/`useEffect`/`useCallback` (sin SWR/React Query)
- **API**: JSON:API spec (`application/vnd.api+json`)

---

## Patrón Canónico por Recurso

Todo módulo nuevo DEBE seguir esta estructura de 5 capas:

```
src/
├── types/{recurso}.ts           → Interfaces TypeScript (contrato con backend)
├── lib/{recurso}.ts             → Mappers JSON:API → TypeScript (normalización)
├── services/{recurso}.ts        → Funciones async (fetchWithAuth + requireEmpresaId)
├── hooks/use{Recurso}.ts        → React hook (loading/error/empty + CRUD actions)
└── app/(sistema)/{ruta}/page.tsx → Página 'use client' que consume el hook
```

### Reglas

1. **Páginas consumen hooks, NO services directamente** — La lógica de estado vive en el hook.
2. **Paginación**: `offset`/`limit` para todos los módulos nuevos. Usar `buildOffsetQuery()` de `lib/pagination.ts`.
3. **JSON:API**: Body en POST/PATCH: `{ data: { type: '<recurso>', attributes: { ... } } }`
4. **Optimistic Locking**: Todo PATCH DEBE enviar `version`. Manejar 409 Conflict.
5. **RBAC en UI**: Cada botón de acción verifica permiso antes de renderizarse.
6. **Tenant**: Toda URL incluye `empresa_id` obtenido vía `requireEmpresaId()` de `lib/api.ts`.
7. **Errores**: Usar `ApiError` de `lib/api.ts`. Nunca `try/catch` silencioso.

---

## Helpers Compartidos

| Archivo | Propósito |
|---------|-----------|
| `lib/api.ts` | `fetchWithAuth()`, `requireEmpresaId()`, `ApiError` |
| `lib/auth.ts` | `setSession()`, `clearSession()`, `getToken()`, `getEmpresaId()`, `ensureSessionRoles()` |
| `lib/jsonapi.ts` | `extractResource()`, `extractResourceList()`, `asRecord()`, `getAttr()` — mappers JSON:API |
| `lib/pagination.ts` | `buildOffsetQuery()`, `calcMeta()`, `extractMetaFromResponse()` |
| `lib/permisos.ts` | `MODULOS_RBAC`, `ACCIONES_RBAC`, `buildPermisosFromRol()` (legacy), `rolSlugFromLabel()` |

---

## Matriz RBAC (PermissionModule del Backend)

| Módulo Frontend | PermissionModule | view | create | edit | delete |
|---|---|---|---|---|---|
| Activos | `activos` | ✅ | ✅ | ✅ | ✅ |
| Órdenes de Trabajo | `mantenimiento` | ✅ | ✅ | ✅ | ✅ |
| Planes de Mantenimiento | `mantenimiento` | ✅ | ✅ | ✅ | ✅ |
| Intervenciones | `mantenimiento` | ✅ | ✅ | ✅ | ✅ |
| Repuestos Utilizados | `mantenimiento` + `inventario` | ✅ | ✅ | ✅ | ✅ (DUAL) |
| Reportes de Falla | `mantenimiento` | ✅ | ✅ | ✅ | ✅ |
| Repuestos/Inventario | `inventario` | ✅ | ✅ | ✅ | ✅ |
| Proveedores | `administracion` | ✅ | ✅ | ✅ | ✅ |
| Usuarios | `administracion` | ✅ | ✅ | ✅ | ✅ |
| Roles | `administracion` | ✅ | ✅ | ✅ | ✅ |
| Ubicaciones | `administracion` | ✅ | ✅ | ✅ | ✅ |
| Preferencias | `preferencias` | ✅ | — | ✅ | — |

---

## Estructura de Directorios

```
src/
├── app/
│   ├── (auth)/          → login, register (sin auth guard)
│   ├── (sistema)/       → páginas protegidas (con layout con sidebar)
│   └── unauthorized/    → página de acceso denegado
├── components/          → Componentes React reutilizables
│   ├── auth/            → Guards, modales de auth
│   ├── layout/          → Sidebar, PageHeader
│   ├── ui/              → Botones, inputs, estados de carga
│   ├── usuarios/        → Componentes del módulo usuarios
│   ├── reportes/        → Componentes del módulo reportes
│   └── configuracion/   → Componentes del módulo configuración
├── hooks/               → React hooks personalizados (useXxx)
├── lib/                 → Helpers, mappers, auth, API client
├── services/            → Funciones async que llaman a la API
└── types/               → Interfaces TypeScript del dominio
```

---

## Idioma

- **Código**: Inglés para nombres de archivos, clases, interfaces, funciones.
- **Atributos de negocio**: Español para campos de la API (`nombre`, `descripcion`, `empresa_id`).
- **UI**: Español para labels, mensajes, placeholders.
- **Rutas de la API**: Español (`/v1/empresas/{id}/activos`, `/v1/auth/ingresar`).

---

## Plan de Implementación

Ver `IMPLEMENTACION.md` en la raíz del monorepo para el plan de fases completo.

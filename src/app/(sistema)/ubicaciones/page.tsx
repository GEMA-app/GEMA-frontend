'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Eye,
  Pencil,
  Trash,
  ChevronRight,
  ChevronDown,
  MapPin,
  Building2,
  Factory,
  FolderTree,
  AlertCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { filterUbicaciones, flattenVisibleRows, type FlatUbicacionRow } from '@/lib/ubicaciones';
import { getActivos } from '@/services/activos';
import { StatCard } from '@/components/ui/StatCard';
import { Badge, type EstadoBadgeType } from '@/components/ui/Badge';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import type { Ubicacion } from '@/types/ubicacion';

const TIPO_FILTER_OPTIONS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'sede', label: 'Sede' },
  { value: 'planta', label: 'Planta' },
  { value: 'area', label: 'Área' },
  { value: 'seccion', label: 'Sección' },
];

export default function UbicacionesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [assetCounts, setAssetCounts] = useState<Record<string, number>>({});

  const { ubicaciones, loading, error, empty, deleteUbicacion } = useUbicaciones();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Fetch asset counts per location
  useEffect(() => {
    let cancelled = false;
    getActivos({ perPage: 100 })
      .then(({ activos }) => {
        if (cancelled) return;
        const counts: Record<string, number> = {};
        for (const a of activos) {
          if (a.ubicacion) {
            counts[a.ubicacion] = (counts[a.ubicacion] || 0) + 1;
          }
        }
        setAssetCounts(counts);
      })
      .catch(() => {
        // non-critical asset count fallback
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const locationMap = useMemo(() => {
    const map: Record<string, { id: string; nombre: string; parentId?: string | null }> = {};
    const walk = (items: Ubicacion[]) => {
      for (const item of items) {
        map[item.id] = { id: item.id, nombre: item.nombre, parentId: item.parentId };
        if (item.hijos?.length) walk(item.hijos);
      }
    };
    if (ubicaciones) walk(ubicaciones);
    return map;
  }, [ubicaciones]);

  const stats = useMemo(() => {
    let total = 0;
    let sedes = 0;
    let plantas = 0;
    let areas = 0;

    const walk = (items: Ubicacion[]) => {
      for (const item of items) {
        total++;
        const t = item.tipo?.toLowerCase();
        if (t === 'sede') sedes++;
        else if (t === 'planta') plantas++;
        else if (t === 'area' || t === 'área') areas++;

        if (item.hijos?.length) walk(item.hijos);
      }
    };
    if (ubicaciones) walk(ubicaciones);
    return { total, sedes, plantas, areas };
  }, [ubicaciones]);

  const filtered = useMemo(() => {
    let result = ubicaciones;
    if (debouncedSearch) {
      result = filterUbicaciones(result, debouncedSearch);
    }
    if (tipoFiltro) {
      const filterByTipo = (items: Ubicacion[]): Ubicacion[] => {
        return items.flatMap((item) => {
          const childrenMatch = item.hijos ? filterByTipo(item.hijos) : [];
          if (item.tipo?.toLowerCase() === tipoFiltro.toLowerCase()) {
            return [{ ...item, hijos: childrenMatch.length ? childrenMatch : item.hijos }];
          }
          if (childrenMatch.length > 0) {
            return [{ ...item, hijos: childrenMatch }];
          }
          return [];
        });
      };
      result = filterByTipo(result);
    }
    return result;
  }, [ubicaciones, debouncedSearch, tipoFiltro]);

  const autoExpanded = useMemo(() => {
    if (!debouncedSearch && !tipoFiltro) return expandedIds;
    const ids = new Set(expandedIds);
    const walk = (items: typeof ubicaciones) => {
      for (const item of items) {
        if (item.hijos?.length) {
          ids.add(item.id);
          walk(item.hijos);
        }
      }
    };
    walk(filtered);
    return ids;
  }, [debouncedSearch, tipoFiltro, filtered, expandedIds]);

  const rows = useMemo(
    () => flattenVisibleRows(filtered, autoExpanded),
    [filtered, autoExpanded],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      const { value } = await Swal.fire({
        title: '¿Eliminar ubicación?',
        text: 'Escribe el nombre de la ubicación para confirmar',
        input: 'text',
        inputPlaceholder: 'Nombre de la ubicación',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#EF4444',
        cancelButtonText: 'Cancelar',
      });
      if (value === undefined) return;
      if (value !== nombre) {
        Swal.fire('Error', 'El nombre no coincide', 'error');
        return;
      }
      try {
        await deleteUbicacion(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar la ubicación');
      }
    },
    [deleteUbicacion],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron ubicaciones para "${debouncedSearch}".`
    : tipoFiltro
      ? `No hay ubicaciones de tipo "${tipoFiltro}".`
      : 'No hay ubicaciones registradas. Crea la primera con el botón "Nueva ubicación".';

  const columns: DataTableColumn<FlatUbicacionRow>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (row) => (
        <div className="flex items-center gap-2" style={{ paddingLeft: `${row.depth * 20}px` }}>
          {row.hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(row.ubicacion.id)}
              className="p-1 rounded-md text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={autoExpanded.has(row.ubicacion.id) ? 'Colapsar' : 'Expandir'}
            >
              {autoExpanded.has(row.ubicacion.id) ? (
                <ChevronDown className="w-4 h-4 text-gema-primary/70 dark:text-white/70" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gema-primary/70 dark:text-white/70" />
              )}
            </button>
          ) : (
            <span className="w-6 block shrink-0" />
          )}
          <span className="font-semibold text-gema-primary dark:text-white">
            {row.ubicacion.nombre}
          </span>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (row) => <Badge estado={row.ubicacion.tipo as EstadoBadgeType} />,
    },
    {
      key: 'padre',
      header: 'Ubicación padre',
      render: (row) => (
        <span className="text-gema-primary/80 dark:text-white/80">
          {row.ubicacion.parentId && locationMap[row.ubicacion.parentId]
            ? locationMap[row.ubicacion.parentId].nombre
            : '—'}
        </span>
      ),
    },
    {
      key: 'activos',
      header: 'Activos asignados',
      render: (row) => {
        const count = assetCounts[row.ubicacion.id] ?? 0;
        return (
          <span className="font-medium text-gema-primary/80 dark:text-white/80">
            {count} {count === 1 ? 'activo' : 'activos'}
          </span>
        );
      },
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/ubicaciones/${row.ubicacion.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver ${row.ubicacion.nombre}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <PermissionGuard module="administracion" action="edit">
            <Link
              href={`/ubicaciones/${row.ubicacion.id}/editar`}
              className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={`Editar ${row.ubicacion.nombre}`}
            >
              <Pencil className="w-4 h-4" strokeWidth={1.5} />
            </Link>
          </PermissionGuard>
          <PermissionGuard module="administracion" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(row.ubicacion.id, row.ubicacion.nombre)}
              className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              aria-label={`Eliminar ${row.ubicacion.nombre}`}
            >
              <Trash className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Ubicaciones
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Jerarquía de sedes, plantas, áreas y secciones
          </p>
        </div>
        <PermissionGuard module="administracion" action="create">
          <Link
            href="/ubicaciones/nuevo"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nueva ubicación
          </Link>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard icon={MapPin} value={stats.total} label="Total ubicaciones" loading={loading} tone="default" />
        <StatCard icon={Building2} value={stats.sedes} label="Sedes" loading={loading} tone="default" />
        <StatCard icon={Factory} value={stats.plantas} label="Plantas" loading={loading} tone="accent" />
        <StatCard icon={FolderTree} value={stats.areas} label="Áreas" loading={loading} tone="accent" />
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            aria-label="Buscar ubicaciones"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            aria-label="Filtrar por tipo"
            className="px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-gema-accent sm:w-56"
          >
            {TIPO_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            keyExtractor={(row) => row.ubicacion.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}

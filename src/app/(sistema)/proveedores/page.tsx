'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Eye, Pencil, Trash, Truck, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { useProveedores } from '@/hooks/useProveedores';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import type { Proveedor } from '@/types/proveedor';

const ESTADO_FILTER_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'activos', label: 'Activos' },
  { value: 'inactivos', label: 'Inactivos' },
];

export default function ProveedoresPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  const { proveedores, loading, error, empty, eliminarProveedor } = useProveedores({
    search: debouncedSearch,
    incluir_inactivos: true,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const summary = useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter((p) => p.activo).length;
    const inactivos = total - activos;
    return { total, activos, inactivos };
  }, [proveedores]);

  const proveedoresFiltrados = useMemo(() => {
    return proveedores.filter((p) => {
      if (estadoFiltro === 'activos' && !p.activo) return false;
      if (estadoFiltro === 'inactivos' && p.activo) return false;
      return true;
    });
  }, [proveedores, estadoFiltro]);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const { value } = await Swal.fire({
        title: '¿Eliminar proveedor?',
        text: 'Escribe el nombre del proveedor para confirmar',
        input: 'text',
        inputPlaceholder: 'Nombre del proveedor',
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#EF4444',
        cancelButtonText: 'Cancelar',
      });
      if (value === undefined) return;
      if (value !== name) {
        Swal.fire('Error', 'El nombre no coincide', 'error');
        return;
      }
      try {
        await eliminarProveedor(id);
      } catch (err) {
        Swal.fire('Error', err instanceof Error ? err.message : 'Error al eliminar el proveedor', 'error');
      }
    },
    [eliminarProveedor],
  );

  const emptyMessage = debouncedSearch
    ? `No se encontraron proveedores para "${debouncedSearch}".`
    : estadoFiltro
      ? `No hay proveedores con estado "${estadoFiltro}".`
      : 'No hay proveedores registrados. Crea el primero con el botón "Nuevo proveedor".';

  const columns: DataTableColumn<Proveedor>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (p) => (
        <div>
          <p className="font-semibold text-gema-primary dark:text-white">{p.name}</p>
          {p.contact && (
            <p className="text-xs text-gema-primary/50 dark:text-white/40">Contacto: {p.contact}</p>
          )}
        </div>
      ),
    },
    {
      key: 'rif',
      header: 'RIF/NIT',
      render: (p) => p.rif || '—',
    },
    {
      key: 'contact',
      header: 'Contacto',
      render: (p) => p.contact || '—',
    },
    {
      key: 'email',
      header: 'Email',
      render: (p) => p.email || '—',
    },
    {
      key: 'phone',
      header: 'Teléfono',
      render: (p) => p.phone || '—',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (p) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {p.activo ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/inventario?proveedorId=${p.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Ver repuestos en inventario"
            aria-label={`Ver repuestos de ${p.name}`}
          >
            <Package className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link
            href={`/proveedores/${p.id}`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Ver ${p.name}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <Link
            href={`/proveedores/${p.id}/editar`}
            className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={`Editar ${p.name}`}
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </Link>
          <button
            type="button"
            onClick={() => handleDelete(p.id, p.name)}
            className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label={`Eliminar ${p.name}`}
          >
            <Trash className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Proveedores
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Gestión y seguimiento de proveedores de repuestos
          </p>
        </div>
        <Link
          href="/proveedores/nuevo"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nuevo proveedor
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          icon={Truck}
          value={summary.total}
          label="Total proveedores"
          loading={loading}
          tone="default"
        />
        <StatCard
          icon={CheckCircle2}
          value={summary.activos}
          label="Proveedores activos"
          loading={loading}
          tone="accent"
        />
        <StatCard
          icon={AlertCircle}
          value={summary.inactivos}
          label="Proveedores inactivos"
          loading={loading}
          tone="danger"
        />
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-5">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por RIF, nombre o contacto..."
            aria-label="Buscar proveedores"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/40 outline-none focus:ring-2 focus:ring-gema-accent"
          />
          <Select
            value={estadoFiltro}
            onChange={setEstadoFiltro}
            options={ESTADO_FILTER_OPTIONS}
            aria-label="Filtrar por estado"
            className="sm:w-56"
          />
        </div>

        {error && empty ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={proveedoresFiltrados}
            keyExtractor={(p) => p.id}
            loading={loading}
            emptyMessage={emptyMessage}
          />
        )}
      </div>
    </div>
  );
}

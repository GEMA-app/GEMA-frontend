'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  type CategoriaCatalogo,
} from '@/services/catalogo';
import { ApiError } from '@/lib/api';
import { DataTable, type DataTableColumn } from '@/components/ui/DataTable';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function promptCategoriaForm(defaults?: { name: string; description: string }) {
  const safeName = defaults?.name ? escapeHtml(defaults.name) : '';
  const safeDesc = defaults?.description ? escapeHtml(defaults.description) : '';
  return Swal.fire({
    title: defaults ? 'Editar categoría' : 'Nueva categoría',
    html: `
      <input id="swal-name" class="swal2-input" placeholder="Nombre" value="${safeName}">
      <textarea id="swal-description" class="swal2-textarea" placeholder="Descripción">${safeDesc}</textarea>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: defaults ? 'Guardar' : 'Crear',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ECA03C',
    preConfirm: () => {
      const name = (document.getElementById('swal-name') as HTMLInputElement)?.value.trim();
      const description = (document.getElementById('swal-description') as HTMLTextAreaElement)?.value.trim();
      if (!name) {
        Swal.showValidationMessage('El nombre es obligatorio.');
        return;
      }
      return { name, description };
    },
  });
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const categoriasData = await getCategorias();
      setCategorias(categoriasData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = useCallback(async () => {
    const { value } = await promptCategoriaForm();
    if (!value) return;
    try {
      await createCategoria({ name: value.name, description: value.description || undefined });
      await Swal.fire({ icon: 'success', title: 'Categoría creada', confirmButtonColor: '#ECA03C' });
      load();
    } catch (err) {
      const is409 = err instanceof ApiError && err.status === 409;
      const msg = is409
        ? 'Ya existe una categoría con ese nombre.'
        : err instanceof ApiError
          ? err.message
          : 'No se pudo crear la categoría.';
      Swal.fire('Error', msg, 'error');
    }
  }, [load]);

  const handleEdit = useCallback(
    async (categoria: CategoriaCatalogo) => {
      const { value } = await promptCategoriaForm({
        name: categoria.name,
        description: categoria.description ?? '',
      });
      if (!value) return;
      try {
        await updateCategoria(categoria.id, {
          name: value.name,
          description: value.description || null,
          version: categoria.version,
        });
        await Swal.fire({ icon: 'success', title: 'Categoría actualizada', confirmButtonColor: '#ECA03C' });
        load();
      } catch (err) {
        const is409 = err instanceof ApiError && err.status === 409;
        const msg = is409
          ? 'Ya existe una categoría con ese nombre.'
          : err instanceof ApiError
            ? err.message
            : 'No se pudo actualizar la categoría.';
        Swal.fire('Error', msg, 'error');
      }
    },
    [load],
  );

  const handleDelete = useCallback(
    async (id: string, nombre: string) => {
      const { value } = await Swal.fire({
        title: '¿Eliminar categoría?',
        text: `Escribe "${nombre}" para confirmar`,
        input: 'text',
        inputPlaceholder: nombre,
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        confirmButtonColor: '#EF4444',
        cancelButtonText: 'Cancelar',
      });
      if (value === undefined) return;
      if (value?.trim().toLowerCase() !== nombre.trim().toLowerCase()) {
        Swal.fire('Error', 'El nombre no coincide', 'error');
        return;
      }
      try {
        await deleteCategoria(id);
        load();
      } catch (err) {
        Swal.fire('Error', err instanceof ApiError ? err.message : 'Error al eliminar la categoría', 'error');
      }
    },
    [load],
  );

  const columns: DataTableColumn<CategoriaCatalogo>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nombre',
        render: (categoria) => (
          <span className="font-semibold text-gema-primary dark:text-white">{categoria.name}</span>
        ),
      },
      {
        key: 'description',
        header: 'Descripción',
        render: (categoria) => (
          <span className="text-gema-primary/70 dark:text-white/70">{categoria.description || '—'}</span>
        ),
      },
      {
        key: 'articulos',
        header: 'Artículos',
        className: 'text-center',
        render: (categoria) => (
          <span className="text-gema-primary/80 dark:text-white/80">{categoria.articulos_count ?? 0}</span>
        ),
      },
      {
        key: 'acciones',
        header: '',
        className: 'text-right',
        render: (categoria) => (
          <div className="flex items-center justify-end gap-2">
            <PermissionGuard module="administracion" action="edit">
              <button
                type="button"
                onClick={() => handleEdit(categoria)}
                className="p-2 rounded-lg text-gema-primary/60 hover:text-gema-primary hover:bg-gema-primary/5 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label={`Editar ${categoria.name}`}
              >
                <Pencil className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </PermissionGuard>
            <PermissionGuard module="administracion" action="delete">
              <button
                type="button"
                onClick={() => handleDelete(categoria.id, categoria.name)}
                className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                aria-label={`Eliminar ${categoria.name}`}
              >
                <Trash className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </PermissionGuard>
          </div>
        ),
      },
    ],
    [handleEdit, handleDelete],
  );

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white">
            Categorías
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gema-primary/60 dark:text-white/50">
            Categorías del catálogo de artículos
          </p>
        </div>
        <PermissionGuard module="administracion" action="create">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm transition-colors cursor-pointer w-fit"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nueva categoría
          </button>
        </PermissionGuard>
      </div>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6">
        {error && categorias.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={categorias}
            keyExtractor={(categoria) => categoria.id}
            loading={loading}
            emptyMessage='No hay categorías registradas. Crea la primera con el botón "Nueva categoría".'
          />
        )}
      </div>
    </div>
  );
}

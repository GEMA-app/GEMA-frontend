'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, Save } from 'lucide-react';
import { createArticulo, getCategorias, type CategoriaCatalogo } from '@/services/catalogo';
import { ApiError } from '@/lib/api';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const initialForm = {
  name: '',
  manufacturer: '',
  model: '',
  category_id: '',
  unit_of_measure: '',
  description: '',
};

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

export default function NuevoArticuloPage() {
  const router = useRouter();

  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCategorias()
      .then((data) => {
        if (!cancelled) setCategorias(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingCategorias(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      await createArticulo({
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim() || undefined,
        model: form.model.trim() || undefined,
        category_id: form.category_id || undefined,
        unit_of_measure: form.unit_of_measure.trim() || undefined,
        description: form.description.trim() || undefined,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Artículo creado',
        text: 'El artículo se agregó correctamente al catálogo.',
        confirmButtonColor: '#ECA03C',
      });
      router.push('/catalogo');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el artículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard
      module="administracion"
      action="create"
      fallback={
        <div className="text-center py-24">
          <p className="text-gema-primary dark:text-white text-lg font-medium">
            No tienes permisos para crear artículos en el catálogo.
          </p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline"
          >
            Volver al catálogo
          </Link>
        </div>
      }
    >
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

        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
          Nuevo artículo
        </h1>

        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Nombre*</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Motor eléctrico 5HP"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Fabricante</label>
              <input
                type="text"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                placeholder="Siemens"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Modelo</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="1LE0001"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Categoría</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                disabled={loadingCategorias}
                className={inputClass}
              >
                <option value="">
                  {loadingCategorias ? 'Cargando categorías...' : 'Sin categoría'}
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Unidad de medida</label>
              <input
                type="text"
                name="unit_of_measure"
                value={form.unit_of_measure}
                onChange={handleChange}
                placeholder="Unidad, kg, litro..."
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Detalles adicionales del artículo"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Link
                href="/catalogo"
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" strokeWidth={2.5} />
                {loading ? 'Guardando...' : 'Guardar artículo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}

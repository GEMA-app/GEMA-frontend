'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, Save } from 'lucide-react';
import { getArticulo, getCategorias, updateArticulo, type CategoriaCatalogo } from '@/services/catalogo';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Select } from '@/components/ui/Select';

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

export default function EditarArticuloPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    manufacturer: '',
    model: '',
    category_id: '',
    description: '',
    unit_of_measure: '',
  });
  const [categorias, setCategorias] = useState<CategoriaCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getArticulo(id), getCategorias()])
      .then(([a, cats]) => {
        setCategorias(cats);
        setForm({
          name: a.name,
          manufacturer: a.manufacturer ?? '',
          model: a.model ?? '',
          category_id: a.category_id ?? '',
          description: a.description ?? '',
          unit_of_measure: a.unit_of_measure ?? '',
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar los datos del artículo.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateArticulo(id!, {
        name: form.name.trim(),
        manufacturer: form.manufacturer.trim() || null,
        model: form.model.trim() || null,
        category_id: form.category_id || null,
        description: form.description.trim() || null,
        unit_of_measure: form.unit_of_measure.trim() || null,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Artículo actualizado',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonColor: '#ECA03C',
      });
      router.push(`/catalogo/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard
      module="administracion"
      action="edit"
      fallback={
        <div className="text-center py-24">
          <p className="text-gema-primary dark:text-white text-lg font-medium">
            No tienes permisos para editar artículos del catálogo.
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
            href={`/catalogo/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al detalle
          </Link>
        </div>

        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
          Editar artículo
        </h1>

        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="name">Nombre*</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="manufacturer">Fabricante</label>
              <input
                id="manufacturer"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="model">Modelo</label>
              <input
                id="model"
                name="model"
                value={form.model}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="category_id">Categoría</label>
              <Select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={(value) => setForm((prev) => ({ ...prev, category_id: value }))}
                options={[
                  { value: '', label: 'Sin categoría' },
                  ...categorias.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="unit_of_measure">Unidad de medida</label>
              <input
                id="unit_of_measure"
                name="unit_of_measure"
                value={form.unit_of_measure}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass} htmlFor="description">Descripción</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/catalogo/${id}`}
                className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" strokeWidth={2.5} />
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, Save } from 'lucide-react';
import { getArticulos, type ArticuloCatalogo } from '@/services/catalogo';
import { useProveedores } from '@/hooks/useProveedores';
import { useRepuestos } from '@/hooks/useRepuestos';
import type { Proveedor } from '@/types/proveedor';

const MONEDAS = ['USD', 'VES', 'EUR'];

const initialFormState = {
  articuloId: '',
  proveedorId: '',
  ubicacion: '',
  stockActual: '0',
  stockMinimo: '0',
  precioUnitario: '0',
  moneda: 'USD',
};

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

export default function NuevoInventarioPage() {
  const router = useRouter();
  const { crearRepuesto } = useRepuestos();
  const { proveedores } = useProveedores();
  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  const [loadingArticulos, setLoadingArticulos] = useState(true);

  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getArticulos({ perPage: 100 })
      .then((data) => {
        if (!cancelled) setArticulos(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingArticulos(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.articuloId) {
      setError('Selecciona un artículo del catálogo.');
      return;
    }
    if (!form.ubicacion.trim()) {
      setError('La ubicación en almacén es obligatoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      await crearRepuesto({
        articulo_id: form.articuloId,
        proveedor_id: form.proveedorId || undefined,
        ubicacion_almacen: form.ubicacion.trim(),
        stock_actual: Number(form.stockActual) || 0,
        stock_minimo: Number(form.stockMinimo) || 0,
        precio_unitario: Number(form.precioUnitario) || 0,
        moneda: form.moneda,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Repuesto registrado',
        text: 'El repuesto se agregó correctamente al inventario.',
        confirmButtonColor: '#ECA03C',
      });
      router.push('/inventario');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el repuesto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a inventario
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Nuevo repuesto
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Artículo del catálogo*</label>
            <select
              name="articuloId"
              value={form.articuloId}
              onChange={handleChange}
              disabled={loadingArticulos}
              required
              className={inputClass}
            >
              <option value="">
                {loadingArticulos ? 'Cargando artículos...' : 'Seleccionar artículo del catálogo'}
              </option>
              {articulos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.model ? ` (${a.model})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Proveedor</label>
            <select
              name="proveedorId"
              value={form.proveedorId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Sin proveedor asignado</option>
              {proveedores.map((p: Proveedor) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Ubicación en almacén*</label>
            <input
              type="text"
              name="ubicacion"
              value={form.ubicacion}
              onChange={handleChange}
              placeholder="Ej: Estante A-3 / Pasillo 2"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Stock inicial</label>
            <input
              type="number"
              min="0"
              name="stockActual"
              value={form.stockActual}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Stock mínimo</label>
            <input
              type="number"
              min="0"
              name="stockMinimo"
              value={form.stockMinimo}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Precio unitario</label>
            <input
              type="number"
              min="0"
              step="0.01"
              name="precioUnitario"
              value={form.precioUnitario}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Moneda</label>
            <select name="moneda" value={form.moneda} onChange={handleChange} className={inputClass}>
              {MONEDAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Link
              href="/inventario"
              className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gema-primary dark:text-white hover:bg-gema-primary/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gema-accent hover:bg-gema-accent/90 text-gray-900 font-semibold text-sm disabled:opacity-60 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" strokeWidth={2.5} />
              {isSubmitting ? 'Guardando...' : 'Guardar repuesto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

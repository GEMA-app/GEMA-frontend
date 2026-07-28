'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { ArrowLeft, Save } from 'lucide-react';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { getArticulos, type ArticuloCatalogo } from '@/services/catalogo';
import { createActivoDirecto } from '@/services/activos';
import { ApiError } from '@/lib/api';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

const MONEDAS = ['USD', 'VES', 'EUR'];

const initialForm = {
  articuloId: '',
  ubicacionId: '',
  serialInterno: '',
  codigoActivo: '',
  fechaAdquisicion: '',
  valorMonetario: '',
  moneda: 'USD',
};

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

export default function NuevoActivoPage() {
  const router = useRouter();
  const { ubicaciones, loading: loadingUbicaciones } = useUbicaciones();
  const ubicacionOptions = useMemo(() => flattenUbicacionesForSelect(ubicaciones), [ubicaciones]);

  const [articulos, setArticulos] = useState<ArticuloCatalogo[]>([]);
  const [loadingArticulos, setLoadingArticulos] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getArticulos({ perPage: 200 })
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

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.articuloId) {
      setError('Selecciona un artículo del catálogo.');
      return;
    }
    if (!form.serialInterno.trim() || !form.codigoActivo.trim()) {
      setError('Serial interno y código de activo son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await createActivoDirecto({
        articuloId: form.articuloId,
        ubicacionId: form.ubicacionId,
        serialInterno: form.serialInterno.trim(),
        codigoActivo: form.codigoActivo.trim(),
        fechaAdquisicion: form.fechaAdquisicion,
        valorMonetario: form.valorMonetario,
        moneda: form.moneda,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Activo registrado',
        text: 'El activo se agregó correctamente al inventario.',
        confirmButtonColor: '#ECA03C',
      });
      router.push('/activos');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const details = err.details as { errors?: Array<{ code?: string }> } | undefined;
        const code = details?.errors?.[0]?.code;
        if (code === 'ERR_ASSET_CODE_EXISTS') {
          setError('Ya existe un activo con ese código.');
        } else if (code === 'ERR_ASSET_SERIAL_EXISTS') {
          setError('Ya existe un activo con ese serial interno.');
        } else {
          setError(err.message);
        }
      } else {
        setError(err instanceof ApiError ? err.message : 'No se pudo registrar el activo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionGuard module="activos" action="create" fallback={
      <div className="text-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">No tienes permisos para crear activos.</p>
        <Link href="/activos" className="mt-4 inline-block text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline">
          Volver a activos
        </Link>
      </div>
    }>
    <div>
      <div className="mb-6">
        <Link
          href="/activos"
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a activos
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Nuevo activo
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelClass}>Artículo*</label>
            <select
              name="articuloId"
              value={form.articuloId}
              onChange={handleChange}
              disabled={loadingArticulos}
              required
              className={inputClass}
            >
              <option value="">
                {loadingArticulos ? 'Cargando artículos...' : 'Selecciona un artículo del catálogo'}
              </option>
              {articulos.map((articulo) => (
                <option key={articulo.id} value={articulo.id}>
                  {articulo.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Ubicación</label>
            <select
              name="ubicacionId"
              value={form.ubicacionId}
              onChange={handleChange}
              disabled={loadingUbicaciones}
              className={inputClass}
            >
              <option value="">
                {loadingUbicaciones ? 'Cargando ubicaciones...' : 'Sin ubicación asignada'}
              </option>
              {ubicacionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Código activo*</label>
            <input
              type="text"
              name="codigoActivo"
              value={form.codigoActivo}
              onChange={handleChange}
              placeholder="AC-0001"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Serial interno*</label>
            <input
              type="text"
              name="serialInterno"
              value={form.serialInterno}
              onChange={handleChange}
              placeholder="SN-00123"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Fecha de adquisición</label>
            <input
              type="date"
              name="fechaAdquisicion"
              value={form.fechaAdquisicion}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Valor monetario</label>
            <input
              type="text"
              inputMode="decimal"
              name="valorMonetario"
              value={form.valorMonetario}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Moneda</label>
            <select name="moneda" value={form.moneda} onChange={handleChange} className={inputClass}>
              {MONEDAS.map((moneda) => (
                <option key={moneda} value={moneda}>
                  {moneda}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Link
              href="/activos"
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
              {loading ? 'Guardando...' : 'Guardar activo'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </PermissionGuard>
  );
}

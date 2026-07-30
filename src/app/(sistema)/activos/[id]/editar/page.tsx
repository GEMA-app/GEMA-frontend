'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { useRouter, useParams } from 'next/navigation';
import { useUbicaciones } from '@/hooks/useUbicaciones';
import { flattenUbicacionesForSelect } from '@/lib/ubicaciones';
import { getActivo, getCatalogArticle, updateActivo } from '@/services/activos';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Select } from '@/components/ui/Select';

const MONEDAS = ['USD', 'VES', 'EUR'];

const ESTADO_OPTIONS = [
  { value: 'Operativo', label: 'Operativo' },
  { value: 'En mantenimiento', label: 'En mantenimiento' },
  { value: 'Fuera de servicio', label: 'Fuera de servicio' },
  { value: 'Dado de baja', label: 'Dado de baja' },
];

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

export default function EditarActivoPage() {
  const params = useParams();
  const activoId = params.id as string;
  const { ubicaciones, loading: loadingUbicaciones, error: ubicacionesError } = useUbicaciones();
  const ubicacionOptions = useMemo(() => flattenUbicacionesForSelect(ubicaciones), [ubicaciones]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    marca: '',
    ubicacion: '',
    fechaCompra: '',
    valorMonetario: '',
    moneda: 'USD',
    estadoInicial: 'Operativo',
    version: 0,
  });
  const [articuloId, setArticuloId] = useState<string>('');
  const [articuloNombre, setArticuloNombre] = useState<string>('');
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!activoId) return;
    let cancelled = false;
    (async () => {
      try {
        const a = await getActivo(activoId);
        if (cancelled) return;
        let marca = '';
        let catName = '';
        try {
          const c = await getCatalogArticle(a.articulo_id);
          if (!cancelled) { marca = c.manufacturer || ''; catName = c.name; }
        } catch { /* ignore */ }
        const estadoMap: Record<string, string> = {
          operativo: 'Operativo',
          en_mantenimiento: 'En mantenimiento',
          fuera_de_servicio: 'Fuera de servicio',
          dado_de_baja: 'Dado de baja',
        };
        if (!cancelled) {
          setArticuloId(a.articulo_id);
          setArticuloNombre(catName);
          setFormData({
            nombre: a.serial_interno,
            codigo: a.codigo_activo,
            marca,
            ubicacion: a.ubicacion_id || '',
            fechaCompra: a.fecha_adquisicion || '',
            valorMonetario: a.valor_monetario?.toString() || '',
            moneda: a.moneda || 'USD',
            estadoInicial: estadoMap[a.estado] || 'Operativo',
            version: a.version,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar el activo.');
      } finally {
        if (!cancelled) setLoadingAsset(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError(null);
  };

  const validateForm = () => {
    const next: Record<string, string> = {};
    if (!formData.nombre.trim()) next.nombre = 'El nombre del activo es obligatorio.';
    if (!formData.codigo.trim()) next.codigo = 'El código de inventario es obligatorio.';
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validateForm();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setError('Por favor corrige los errores antes de guardar.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await updateActivo(activoId, formData);
      await Swal.fire({
        icon: 'success',
        title: 'Activo actualizado',
        text: 'Los cambios se guardaron correctamente.',
        confirmButtonColor: '#ECA03C',
      });
      router.push(`/activos/${activoId}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(
        /no se puede transicionar/i.test(msg)
          ? 'Los activos dados de baja no pueden cambiar de estado. Si necesitas registrar este activo de nuevo, crea uno desde cero.'
          : msg || 'Error al actualizar el activo',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAsset) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 rounded-full border-2 border-gema-primary/20 dark:border-white/20 border-t-gema-accent animate-spin" />
      </div>
    );
  }

  return (
    <PermissionGuard module="activos" action="edit" fallback={
      <div className="text-center py-24">
        <p className="text-gema-primary dark:text-white text-lg font-medium">No tienes permisos para editar activos.</p>
        <Link href={`/activos/${activoId}`} className="mt-4 inline-block text-sm font-semibold text-gema-accent-dark dark:text-gema-accent hover:underline">
          Volver a la ficha
        </Link>
      </div>
    }>
      <div>
        <div className="mb-6">
          <Link
            href={`/activos/${activoId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la ficha
          </Link>
        </div>

        <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
          Editar activo
        </h1>

        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Artículo (catálogo)</label>
              <p className="text-sm py-3 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                {articuloNombre ? (
                  <Link href={`/catalogo/${articuloId}`} className="text-gema-accent-dark dark:text-gema-accent hover:underline">
                    {articuloNombre}
                  </Link>
                ) : '—'}
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="nombre">Nombre del activo*</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                className={inputClass}
              />
              {errors.nombre && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="codigo">Código inventario*</label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                value={formData.codigo}
                onChange={handleChange}
                required
                className={inputClass}
              />
              {errors.codigo && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.codigo}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="marca">Marca / Fabricante</label>
              <input
                id="marca"
                name="marca"
                type="text"
                value={formData.marca}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="ubicacion">
                Ubicación física
                {formData.ubicacion && (
                  <Link href={`/ubicaciones/${formData.ubicacion}`} className="ml-2 font-normal text-gema-accent-dark dark:text-gema-accent hover:underline">
                    (Ver actual)
                  </Link>
                )}
              </label>
              <Select
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={(value) => handleSelectChange('ubicacion', value)}
                disabled={loadingUbicaciones}
                options={[
                  { value: '', label: loadingUbicaciones ? 'Cargando ubicaciones...' : 'Seleccione una ubicación' },
                  ...ubicacionOptions.map((o) => ({ value: o.id, label: o.label })),
                ]}
              />
              {ubicacionesError && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">{ubicacionesError}</p>}
            </div>

            <div>
              <label className={labelClass} htmlFor="fechaCompra">Fecha de compra</label>
              <input
                id="fechaCompra"
                name="fechaCompra"
                type="date"
                value={formData.fechaCompra}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="valorMonetario">Valor monetario</label>
              <input
                id="valorMonetario"
                name="valorMonetario"
                type="text"
                inputMode="decimal"
                value={formData.valorMonetario}
                onChange={handleChange}
                placeholder="0.00"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="moneda">Moneda</label>
              <Select
                id="moneda"
                name="moneda"
                value={formData.moneda}
                onChange={(value) => handleSelectChange('moneda', value)}
                options={MONEDAS.map((moneda) => ({ value: moneda, label: moneda }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Estado</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ESTADO_OPTIONS.map((estado) => (
                  <label
                    key={estado.value}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                      formData.estadoInicial === estado.value
                        ? 'border-gema-accent bg-gema-accent/10'
                        : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="estadoInicial"
                      value={estado.value}
                      checked={formData.estadoInicial === estado.value}
                      onChange={handleChange}
                      className="accent-gema-accent w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gema-primary dark:text-white">{estado.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <Link
                href={`/activos/${activoId}`}
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
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
}

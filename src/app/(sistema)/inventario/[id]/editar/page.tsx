'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { getRepuestoById, updateRepuesto } from '@/services/repuestos';
import { getProveedores } from '@/services/proveedores';
import { Select } from '@/components/ui/Select';
import type { Repuesto } from '@/types/repuesto';
import type { Proveedor } from '@/types/proveedor';

const MONEDAS = ['USD', 'VES', 'EUR'];

const labelClass = 'block text-[13px] font-semibold text-gray-700 dark:text-white/80 mb-1.5';
const inputClass =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white outline-none box-border focus:ring-2 focus:ring-gema-accent/40';

export default function EditarInventarioPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [proveedorId, setProveedorId] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [precio, setPrecio] = useState('0');
  const [moneda, setMoneda] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const [r, pRes] = await Promise.all([
          getRepuestoById(id),
          getProveedores().catch(() => ({ proveedores: [] })),
        ]);
        if (cancelled) return;
        setRepuesto(r);
        setProveedores(pRes.proveedores);
        setProveedorId(r.proveedor_id ?? '');
        setUbicacion(r.ubicacion_almacen);
        setStockMinimo(String(r.stock_minimo));
        setPrecio(String(r.precio_unitario));
        setMoneda(r.moneda);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar el repuesto');
      } finally {
        if (!cancelled) setLoadingAsset(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!repuesto) return;

    if (!ubicacion.trim()) {
      setError('La ubicación en almacén es obligatoria.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await updateRepuesto(id, {
        proveedor_id: proveedorId || undefined,
        ubicacion_almacen: ubicacion.trim(),
        stock_minimo: Number(stockMinimo),
        precio_unitario: Number(precio),
        moneda,
        version: repuesto.version,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Repuesto actualizado',
        text: 'Los datos del repuesto se guardaron correctamente.',
        confirmButtonColor: '#ECA03C',
      });

      router.push(`/inventario/${id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los cambios';
      setError(msg);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonColor: '#ECA03C',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingAsset) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href={`/inventario/${id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al detalle
          </Link>
        </div>
        <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center text-gema-primary/60 dark:text-white/50">
          Cargando repuesto...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/inventario/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gema-primary/70 hover:text-gema-primary dark:text-white/60 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al detalle
        </Link>
      </div>

      <h1 className="font-heading font-bold text-xl sm:text-2xl lg:text-3xl text-gema-primary dark:text-white mb-6 sm:mb-8">
        Editar repuesto
      </h1>

      <div className="bg-white dark:bg-gema-surface-dark rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6 lg:p-8 max-w-3xl">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Artículo ID</label>
            <input
              type="text"
              disabled
              value={repuesto?.articulo_id ?? ''}
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={labelClass}>Stock actual</label>
            <input
              type="text"
              disabled
              value={repuesto?.stock_actual ?? '0'}
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
          </div>

          <div>
            <label className={labelClass}>Proveedor</label>
            <Select
              value={proveedorId}
              onChange={(value) => setProveedorId(value)}
              options={[
                { value: '', label: 'Sin proveedor asignado' },
                ...proveedores.map((p) => ({ value: p.id, label: p.name || p.id })),
              ]}
              className="w-full"
            />
          </div>

          <div>
            <label className={labelClass}>Ubicación en almacén*</label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Stock mínimo</label>
            <input
              type="number"
              min="0"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Precio unitario</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Moneda</label>
            <Select
              value={moneda}
              onChange={(value) => setMoneda(value)}
              options={MONEDAS.map((m) => ({ value: m, label: m }))}
              className="w-full"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Link
              href={`/inventario/${id}`}
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
  );
}

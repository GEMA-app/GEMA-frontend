'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getArticulos, getProveedores } from '@/services/repuestos';
import type { DropdownOption, NuevoRepuestoInput } from '@/types/repuesto';

interface NuevoRepuestoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: NuevoRepuestoInput) => Promise<void>;
  saving?: boolean;
}

export function NuevoRepuestoModal({
  isOpen,
  onClose,
  onSave,
  saving = false,
}: NuevoRepuestoModalProps) {
  const [articulos, setArticulos] = useState<DropdownOption[]>([]);
  const [proveedores, setProveedores] = useState<DropdownOption[]>([]);
  const [articuloId, setArticuloId] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [stockActual, setStockActual] = useState('0');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [ubicacion, setUbicacion] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('0.00');
  const [moneda, setMoneda] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setArticuloId('');
    setProveedorId('');
    setStockActual('0');
    setStockMinimo('0');
    setUbicacion('');
    setPrecioUnitario('0.00');
    setMoneda('USD');
    setError(null);
    setArticulos([]);
    setProveedores([]);

    const fetchDropdowns = async () => {
      setLoadingDropdowns(true);
      const [a, p] = await Promise.all([
        getArticulos().catch(() => [] as DropdownOption[]),
        getProveedores().catch(() => [] as DropdownOption[]),
      ]);
      setArticulos(a);
      setProveedores(p);
      setLoadingDropdowns(false);
    };

    void fetchDropdowns();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await onSave({
        articuloId,
        proveedorId,
        stockActual: Number(stockActual),
        stockMinimo: Number(stockMinimo),
        ubicacion,
        precioUnitario,
        moneda,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear el repuesto.';
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nuevo-repuesto-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#DED4C7] bg-[#F7F4EF] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EBE2D5] px-6 py-4">
          <h2 id="nuevo-repuesto-title" className="text-xl font-bold text-gray-800">
            Nuevo repuesto
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-white/70 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p className="rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="repuesto-articulo" className="mb-1 block text-sm font-semibold text-gray-700">
              Artículo
            </label>
            <select
              id="repuesto-articulo"
              value={articuloId}
              onChange={(e) => setArticuloId(e.target.value)}
              required
              disabled={loadingDropdowns}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] disabled:opacity-60"
            >
              <option value="">
                {loadingDropdowns ? 'Cargando…' : 'Seleccionar artículo'}
              </option>
              {articulos.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="repuesto-proveedor" className="mb-1 block text-sm font-semibold text-gray-700">
              Proveedor
            </label>
            <select
              id="repuesto-proveedor"
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              required
              disabled={loadingDropdowns}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] disabled:opacity-60"
            >
              <option value="">
                {loadingDropdowns ? 'Cargando…' : 'Seleccionar proveedor'}
              </option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="repuesto-stock-actual" className="mb-1 block text-sm font-semibold text-gray-700">
                Stock actual
              </label>
              <input
                id="repuesto-stock-actual"
                type="number"
                min={0}
                value={stockActual}
                onChange={(e) => setStockActual(e.target.value)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              />
            </div>
            <div>
              <label htmlFor="repuesto-stock-minimo" className="mb-1 block text-sm font-semibold text-gray-700">
                Stock mínimo
              </label>
              <input
                id="repuesto-stock-minimo"
                type="number"
                min={0}
                value={stockMinimo}
                onChange={(e) => setStockMinimo(e.target.value)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="repuesto-ubicacion" className="mb-1 block text-sm font-semibold text-gray-700">
              Ubicación (almacén)
            </label>
            <input
              id="repuesto-ubicacion"
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="repuesto-precio" className="mb-1 block text-sm font-semibold text-gray-700">
                Precio unitario
              </label>
              <input
                id="repuesto-precio"
                type="text"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              />
            </div>
            <div>
              <label htmlFor="repuesto-moneda" className="mb-1 block text-sm font-semibold text-gray-700">
                Moneda
              </label>
              <select
                id="repuesto-moneda"
                value={moneda}
                onChange={(e) => setMoneda(e.target.value)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="VES">VES</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#DED4C7] bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || loadingDropdowns}
              className="rounded-xl bg-[#E5A93D] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d19730] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getProveedores } from '@/services/repuestos';
import type { ActualizarRepuestoInput, DropdownOption, Repuesto } from '@/types/repuesto';

interface EditarRepuestoModalProps {
  isOpen: boolean;
  repuesto: Repuesto | null;
  onClose: () => void;
  onSave: (id: string, input: ActualizarRepuestoInput) => Promise<void>;
  saving?: boolean;
}

export function EditarRepuestoModal({
  isOpen,
  repuesto,
  onClose,
  onSave,
  saving = false,
}: EditarRepuestoModalProps) {
  const [proveedores, setProveedores] = useState<DropdownOption[]>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [stockMinimo, setStockMinimo] = useState('0');
  const [ubicacion, setUbicacion] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('0.00');
  const [moneda, setMoneda] = useState('USD');
  const [error, setError] = useState<string | null>(null);
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  useEffect(() => {
    if (!isOpen || !repuesto) return;
    setProveedorId(repuesto.proveedorId);
    setStockMinimo(String(repuesto.stockMinimo));
    setUbicacion(repuesto.ubicacion);
    setPrecioUnitario(repuesto.precioUnitario);
    setMoneda(repuesto.moneda);
    setError(null);

    const fetchProveedores = async () => {
      setLoadingDropdown(true);
      try {
        setProveedores(await getProveedores());
      } catch {
        setError('No se pudieron cargar los proveedores.');
      } finally {
        setLoadingDropdown(false);
      }
    };

    void fetchProveedores();
  }, [isOpen, repuesto]);

  if (!isOpen || !repuesto) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await onSave(repuesto.id, {
        proveedorId,
        stockMinimo: Number(stockMinimo),
        ubicacion,
        precioUnitario,
        moneda,
        version: repuesto.version,
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el repuesto.';
      setError(message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-repuesto-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[#DED4C7] bg-[#F7F4EF] shadow-xl">
        <div className="flex items-center justify-between border-b border-[#EBE2D5] px-6 py-4">
          <h2 id="editar-repuesto-title" className="text-xl font-bold text-gray-800">
            Editar repuesto
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

          <p className="text-sm text-gray-500 bg-white/60 rounded-xl px-3 py-2">
            Artículo: <span className="font-semibold text-gray-700">{repuesto.articuloId}</span>
          </p>

          <div>
            <label htmlFor="editar-repuesto-proveedor" className="mb-1 block text-sm font-semibold text-gray-700">
              Proveedor
            </label>
            <select
              id="editar-repuesto-proveedor"
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
              disabled={loadingDropdown}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C] disabled:opacity-60"
            >
              <option value="">
                {loadingDropdown ? 'Cargando…' : 'Seleccionar proveedor'}
              </option>
              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="editar-repuesto-stock-minimo" className="mb-1 block text-sm font-semibold text-gray-700">
              Stock mínimo
            </label>
            <input
              id="editar-repuesto-stock-minimo"
              type="number"
              min={0}
              value={stockMinimo}
              onChange={(e) => setStockMinimo(e.target.value)}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div>
            <label htmlFor="editar-repuesto-ubicacion" className="mb-1 block text-sm font-semibold text-gray-700">
              Ubicación (almacén)
            </label>
            <input
              id="editar-repuesto-ubicacion"
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editar-repuesto-precio" className="mb-1 block text-sm font-semibold text-gray-700">
                Precio unitario
              </label>
              <input
                id="editar-repuesto-precio"
                type="text"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full rounded-xl border border-[#DED4C7] bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#ECA03C]"
              />
            </div>
            <div>
              <label htmlFor="editar-repuesto-moneda" className="mb-1 block text-sm font-semibold text-gray-700">
                Moneda
              </label>
              <select
                id="editar-repuesto-moneda"
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
              disabled={saving || loadingDropdown}
              className="rounded-xl bg-[#E5A93D] px-4 py-2 text-sm font-semibold text-black hover:bg-[#d19730] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

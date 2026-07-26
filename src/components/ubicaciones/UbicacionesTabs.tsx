export type UbicacionesVista = 'lista';

interface UbicacionesTabsProps {
  vista: UbicacionesVista;
  onChange: (vista: UbicacionesVista) => void;
}

export function UbicacionesTabs({ vista, onChange }: UbicacionesTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-[#DED4C7] bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('lista')}
        className="rounded-lg px-4 py-2 text-xs font-bold tracking-wide bg-[#E5A93D] text-black shadow-sm"
      >
        LISTA DE UBIC.
      </button>
    </div>
  );
}


export type UbicacionesVista = 'lista' | 'mapa';

interface UbicacionesTabsProps {
  vista: UbicacionesVista;
  onChange: (vista: UbicacionesVista) => void;
}

export function UbicacionesTabs({ vista, onChange }: UbicacionesTabsProps) {
  const tabs: { id: UbicacionesVista; label: string }[] = [
    { id: 'lista', label: 'LISTA DE UBIC.' },
    { id: 'mapa', label: 'MAPA' },
  ];

  return (
    <div className="inline-flex rounded-xl border border-[#DED4C7] bg-white p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = vista === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#E5A93D] text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-[#F7F4EF]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

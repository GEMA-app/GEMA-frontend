'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Factory, Box, Package, Eye, Pencil, Trash, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import type { Ubicacion, TipoUbicacion } from '@/types/ubicacion';

const ICONOS: Record<TipoUbicacion, typeof Building2> = {
  sede: Building2,
  planta: Factory,
  area: Box,
  seccion: Package,
};

const COLORES_NODO: Record<TipoUbicacion, { bg: string; border: string; text: string; light: string }> = {
  sede: { bg: 'bg-[#E8EAF6]', border: 'border-[#283593]', text: 'text-[#283593]', light: 'bg-[#F5F6FD]' },
  planta: { bg: 'bg-[#E8F5E9]', border: 'border-[#2E7D32]', text: 'text-[#2E7D32]', light: 'bg-[#F1F9F2]' },
  area: { bg: 'bg-[#FFF3E0]', border: 'border-[#E65100]', text: 'text-[#E65100]', light: 'bg-[#FFF9F0]' },
  seccion: { bg: 'bg-[#F3E5F5]', border: 'border-[#6A1B9A]', text: 'text-[#6A1B9A]', light: 'bg-[#FBF0FC]' },
};

const ETIQUETAS: Record<TipoUbicacion, string> = {
  sede: 'Sede',
  planta: 'Planta',
  area: 'Área',
  seccion: 'Sección',
};

interface MapaUbicacionesProps {
  ubicaciones: Ubicacion[];
  onDelete?: (id: string, nombre: string) => void;
}

function NodoMapa({
  ubicacion,
  depth = 0,
  onDelete,
}: {
  ubicacion: Ubicacion;
  depth?: number;
  onDelete?: (id: string, nombre: string) => void;
}) {
  const [expandido, setExpandido] = useState(depth < 1);
  const colores = COLORES_NODO[ubicacion.tipo as TipoUbicacion] ?? COLORES_NODO.area;
  const Icono = ICONOS[ubicacion.tipo as TipoUbicacion] ?? Box;
  const tieneHijos = Boolean(ubicacion.hijos?.length);

  return (
    <div className="flex flex-col items-center">
      {/* tarjeta del nodo */}
      <div
        className={`relative flex flex-col items-center rounded-2xl ${colores.bg} border-2 ${colores.border} shadow-sm min-w-[180px] transition-all hover:shadow-md`}
      >
        {/* encabezado con icono + nombre */}
        <div className="w-full px-4 pt-3 pb-2 flex flex-col items-center gap-1">
          <div className={`w-9 h-9 rounded-full ${colores.light} border ${colores.border} flex items-center justify-center`}>
            <Icono className={`w-5 h-5 ${colores.text}`} strokeWidth={1.5} />
          </div>
          <p className={`font-bold text-sm ${colores.text} text-center leading-tight`}>{ubicacion.nombre}</p>
          <span className={`text-[10px] font-semibold ${colores.text} opacity-70`}>{ETIQUETAS[ubicacion.tipo as TipoUbicacion] ?? ubicacion.tipo}</span>
        </div>

        {/* acciones */}
        <div className={`w-full flex items-center justify-center gap-1 pb-2 pt-1 border-t ${colores.border}/20`}>
          <Link
            href={`/ubicaciones/${ubicacion.id}`}
            className={`p-1.5 rounded-lg ${colores.text} hover:${colores.light} transition-colors`}
            aria-label={`Ver ${ubicacion.nombre}`}
          >
            <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
          <Link
            href={`/ubicaciones/${ubicacion.id}/editar`}
            className={`p-1.5 rounded-lg ${colores.text} hover:${colores.light} transition-colors`}
            aria-label={`Editar ${ubicacion.nombre}`}
          >
            <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
          </Link>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(ubicacion.id, ubicacion.nombre)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              aria-label={`Eliminar ${ubicacion.nombre}`}
            >
              <Trash className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* botón expandir/colapsar */}
        {tieneHijos && (
          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full ${colores.bg} border-2 ${colores.border} ${colores.text} flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-sm z-10`}
            aria-label={expandido ? 'Colapsar' : 'Expandir'}
          >
            {expandido ? <ChevronDown className="w-4 h-4" strokeWidth={3} /> : <ChevronRight className="w-4 h-4" strokeWidth={3} />}
          </button>
        )}
      </div>

      {/* hijos */}
      {tieneHijos && expandido && (
        <div className="relative flex flex-col items-center mt-6">
          {/* conector vertical */}
          <svg className="absolute top-0 left-1/2 -translate-x-1/2" width="2" height="16" xmlns="http://www.w3.org/2000/svg">
            <line x1="1" y1="0" x2="1" y2="16" stroke="#D1D5DB" strokeWidth="2" />
          </svg>
          <div className="flex flex-row gap-4 pt-4 relative">
            {/* línea horizontal conectando todos los hijos */}
            {ubicacion.hijos!.length > 1 && (
              <svg
                className="absolute top-0 left-[12.5%] right-[12.5%]"
                height="16"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: `${ubicacion.hijos!.length * 100}%` }}
              >
                <line x1="0" y1="0" x2="100%" y2="0" stroke="#D1D5DB" strokeWidth="2" />
              </svg>
            )}
            {ubicacion.hijos!.map((hijo, idx) => (
              <div key={hijo.id} className="flex flex-col items-center relative">
                <svg width="2" height="16" xmlns="http://www.w3.org/2000/svg">
                  <line x1="1" y1="0" x2="1" y2="16" stroke="#D1D5DB" strokeWidth="2" />
                </svg>
                <NodoMapa ubicacion={hijo} depth={depth + 1} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MapaUbicaciones({ ubicaciones, onDelete }: MapaUbicacionesProps) {
  if (!ubicaciones.length) {
    return (
      <div className="bg-[#EBE2D5] rounded-2xl border border-[#DED4C7]/50 px-8 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#EED586] text-[#8B5E3C] mb-4">
          <Building2 size={28} strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No hay ubicaciones</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Crea ubicaciones para ver el mapa jerárquico de sedes, plantas, áreas y secciones.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#EBE2D5] rounded-2xl border border-[#DED4C7]/50 p-8 overflow-x-auto">
      <div className="flex flex-col items-center min-w-fit">
        {ubicaciones.map((root, idx) => (
          <div key={root.id} className="flex flex-col items-center">
            {idx > 0 && (
              <svg width="2" height="24" xmlns="http://www.w3.org/2000/svg">
                <line x1="1" y1="0" x2="1" y2="24" stroke="#D1D5DB" strokeWidth="2" />
              </svg>
            )}
            <NodoMapa ubicacion={root} depth={0} onDelete={onDelete} />
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 mt-8">
        Mapa jerárquico — Haz clic en
        <ChevronRight className="w-3 h-3 inline mx-0.5 text-gray-400" strokeWidth={3} />
        para expandir o
        <ChevronDown className="w-3 h-3 inline mx-0.5 text-gray-400" strokeWidth={3} />
        para colapsar
      </p>
    </div>
  );
}

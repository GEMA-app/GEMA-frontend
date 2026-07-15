'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

type Vista = 'ordenes' | 'calendario';
type EstadoOrden = 'Pendiente' | 'En progreso' | 'Completado' | 'Cancelado';
type TipoEvento = 'preventivo' | 'correctivo' | 'cancelado';

interface OrdenRow {
  id: string;
  activo: string;
  fecha: string;
  estado: EstadoOrden;
}

interface EventoCalendario {
  dia: number;
  titulo: string;
  tipo: TipoEvento;
}

const ESTADO_BACKEND_MAP: Record<string, EstadoOrden> = {
  abierta: 'Pendiente',
  en_proceso: 'En progreso',
  cerrada: 'Completado',
  cancelada: 'Cancelado',
};

function mapEstado(estado: string): EstadoOrden {
  return ESTADO_BACKEND_MAP[estado] ?? 'Pendiente';
}

const EVENTOS_MARZO_2026: EventoCalendario[] = [
  { dia: 5, titulo: 'Preventivo — Compresor', tipo: 'preventivo' },
  { dia: 12, titulo: 'Correctivo — Bomba', tipo: 'correctivo' },
  { dia: 18, titulo: 'Preventivo — Motor', tipo: 'preventivo' },
  { dia: 20, titulo: 'OT-098 Pendiente', tipo: 'correctivo' },
  { dia: 25, titulo: 'OT-104 En progreso', tipo: 'preventivo' },
  { dia: 28, titulo: 'Cancelado — Panel', tipo: 'cancelado' },
];

const DIAS_SEMANA = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const ESTADO_STYLES: Record<EstadoOrden, string> = {
  Pendiente: 'bg-[#FFF3E0] text-[#E65100]',
  'En progreso': 'bg-[#E3F2FD] text-[#1565C0]',
  Completado: 'bg-[#E8F5E9] text-[#2E7D32]',
  Cancelado: 'bg-[#F5F5F5] text-[#757575]',
};

const EVENTO_STYLES: Record<TipoEvento, string> = {
  preventivo: 'bg-[#E3F2FD] text-[#1565C0] border-l-[#1565C0]',
  correctivo: 'bg-[#FFF3E0] text-[#E65100] border-l-[#E65100]',
  cancelado: 'bg-[#F5F5F5] text-[#757575] border-l-[#9E9E9E]',
};

function PageHeader() {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar orden..."
          className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-[#ECA03C] outline-none"
        />
      </div>
      <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
        <Bell className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
      </button>
      <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
        <User className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
      </button>
    </div>
  );
}

function VistaTabs({ vista, onChange }: { vista: Vista; onChange: (v: Vista) => void }) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => onChange('ordenes')}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
          vista === 'ordenes'
            ? 'bg-[#2B405B] text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        Órdenes de trabajo
      </button>
      <button
        onClick={() => onChange('calendario')}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
          vista === 'calendario'
            ? 'bg-[#2B405B] text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
        }`}
      >
        Calendario
      </button>
    </div>
  );
}

function OrdenesView({
  ordenes,
  loading,
  error,
}: {
  ordenes: OrdenRow[];
  loading: boolean;
  error: string | null;
}) {
  const counts = ordenes.reduce(
    (acc, o) => { acc[o.estado] = (acc[o.estado] ?? 0) + 1; return acc; },
    {} as Record<string, number>,
  );

  const resumen = [
    { label: 'Pendientes',  count: counts['Pendiente']    ?? 0, bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' },
    { label: 'En progreso', count: counts['En progreso']  ?? 0, bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
    { label: 'Completados', count: counts['Completado']   ?? 0, bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
    { label: 'Cancelados',  count: counts['Cancelado']    ?? 0, bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {resumen.map((item) => (
          <div
            key={item.label}
            className={`${item.bg} rounded-2xl p-5 flex flex-col items-center justify-center`}
          >
            <span className={`text-3xl font-bold ${item.text}`}>{item.count}</span>
            <span className={`text-sm font-medium mt-1 ${item.text}`}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Ordenes de trabajo</h2>
        </div>

        {loading && (
          <p className="text-sm text-gray-500 py-8 text-center">Cargando órdenes…</p>
        )}
        {error && (
          <p className="text-sm text-red-600 py-4 px-4 rounded-xl bg-red-50">{error}</p>
        )}
        {!loading && !error && ordenes.length === 0 && (
          <p className="text-sm text-gray-400 py-8 text-center">No hay órdenes de trabajo registradas.</p>
        )}

        {!loading && ordenes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Orden</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Activo</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="pb-4 pr-6 text-sm font-semibold text-gray-900">Estado</th>
                  <th className="pb-4 text-sm font-semibold text-gray-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-5 pr-6 font-semibold text-gray-900">{orden.id}</td>
                    <td className="py-5 pr-6 text-gray-700">{orden.activo}</td>
                    <td className="py-5 pr-6 text-gray-700">{orden.fecha}</td>
                    <td className="py-5 pr-6">
                      <span
                        className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${ESTADO_STYLES[orden.estado]}`}
                      >
                        {orden.estado}
                      </span>
                    </td>
                    <td className="py-5 text-right">
                      <button
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={`Opciones de ${orden.id}`}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function CalendarioView() {
  const router = useRouter();
  const hoy = new Date();

  // Estado con el mes/año actual (inicia en el mes actual)
  const [fechaActual, setFechaActual] = useState(new Date());

  // Cambiar mes (incremento: -1 o +1)
  const cambiarMes = (incremento: number) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    setFechaActual(nuevaFecha);
  };

  // Redirigir al hacer clic en un día
  const handleClickDia = (dia: number) => {
    const fechaSeleccionada = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth(),
      dia
    );
    const fechaStr = fechaSeleccionada.toISOString().split('T')[0];
    router.push(`/mantenimiento/calendario?fecha=${fechaStr}`);
  };

  // Generar las celdas del calendario (depende de fechaActual)
  const celdas = useMemo(() => {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // lunes = 0

    const cells = [];

    // Celdas vacías antes del primer día
    for (let i = 0; i < startOffset; i++) {
      cells.push({ dia: null, eventos: [] });
    }

    // Días del mes
    for (let dia = 1; dia <= daysInMonth; dia++) {
      cells.push({
        dia,
        eventos: EVENTOS_MARZO_2026.filter((e) => e.dia === dia),
      });
    }

    // Completar última semana
    while (cells.length % 7 !== 0) {
      cells.push({ dia: null, eventos: [] });
    }

    return cells;
  }, [fechaActual]);

  const mes = fechaActual.toLocaleString('es', { month: 'long' });
  const año = fechaActual.getFullYear();
  const tituloMes = `${mes} ${año}`;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      {/* Cabecera con botón "Agregar Mantenimiento" */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Calendario de mantenimientos
        </h2>
        <Link
          href="/mantenimiento/calendario"
          className="inline-flex items-center gap-2 bg-[#ECA03C] hover:bg-[#d4912f] text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Agregar Mantenimiento
        </Link>
      </div>

      {/* Navegación de meses */}
      <div className="flex items-center justify-between mb-6">
        <button
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          aria-label="Mes anterior"
          onClick={() => cambiarMes(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900 capitalize">
          {tituloMes}
        </h3>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          aria-label="Mes siguiente"
          onClick={() => cambiarMes(1)}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
        {/* Días de la semana */}
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="bg-[#F9FAFB] py-3 text-center text-xs font-bold text-gray-500"
          >
            {dia}
          </div>
        ))}

        {/* Celdas de días */}
        {
          celdas.map((celda, index) => {
            // Determinar si este día es hoy
            const esHoy =
              celda.dia !== null &&
              fechaActual.getFullYear() === hoy.getFullYear() &&
              fechaActual.getMonth() === hoy.getMonth() &&
              celda.dia === hoy.getDate();

            return (
              <div
                key={index}
                className={`bg-white min-h-[100px] p-2 ${
                  celda.dia ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50'
                }`}
                onClick={() => celda.dia && handleClickDia(celda.dia)}
              >
                {celda.dia && (
                  <>
                    {/* Número del día con círculo naranja si es hoy */}
                    <div className="relative inline-block">
                      <span
                        className={`text-sm font-semibold ${
                          esHoy ? 'text-white' : 'text-gray-700'
                        } relative z-10`}
                      >
                        {celda.dia}
                      </span>
                      {esHoy && (
                        <span
                          className="absolute inset-0 -m-1 rounded-full bg-[#ECA03C] z-0"
                          style={{
                            width: 'calc(100% + 12px)',
                            height: 'calc(90% + 12px)',
                          }}
                        />
                      )}
                    </div>

                    {/* Eventos del día */}
                    <div className="mt-1 space-y-1">
                      {celda.eventos.map((evento, i) => (
                        <div
                          key={i}
                          className={`text-[10px] leading-tight px-1.5 py-1 rounded border-l-2 truncate ${
                            EVENTO_STYLES[evento.tipo]
                          }`}
                          title={evento.titulo}
                        >
                          {evento.titulo}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })
        }
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#1565C0]" />
          Preventivo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#E65100]" />
          Correctivo
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-[#9E9E9E]" />
          Cancelado
        </span>
      </div>
    </div>
  );
}

export default function MantenimientoPage() {
  const [vista, setVista] = useState<Vista>('ordenes');
  const [ordenes, setOrdenes] = useState<OrdenRow[]>([]);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [errorOrdenes, setErrorOrdenes] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const empresaId = localStorage.getItem('empresa_id');

    if (!token || !empresaId) {
      window.location.href = '/login';
      return;
    }

    async function fetchOrdenes() {
      setLoadingOrdenes(true);
      setErrorOrdenes(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/empresas/${empresaId}/ordenes-trabajo`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/vnd.api+json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const mapped: OrdenRow[] = (result.data ?? []).map((item: Record<string, any>) => ({
          id: item.attributes?.codigo_ot ?? item.id,
          activo: item.attributes?.activo_id ?? '—',
          fecha: item.attributes?.fecha_apertura
            ? new Date(item.attributes.fecha_apertura as string).toLocaleDateString('es')
            : '—',
          estado: mapEstado(item.attributes?.estado ?? ''),
        }));
        setOrdenes(mapped);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar las órdenes de trabajo.';
        setErrorOrdenes(message);
      } finally {
        setLoadingOrdenes(false);
      }
    }

    void fetchOrdenes();
  }, []);

  return (
    <div className="flex-1 bg-[#F3F4F6] p-8 overflow-y-auto">
      <header className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Mantenimiento</h1>
          <p className="text-gray-500 text-sm">
            {vista === 'ordenes'
              ? 'Gestión de órdenes de trabajo y mantenimientos'
              : 'Programación y seguimiento de mantenimientos'}
          </p>
        </div>
        <PageHeader />
      </header>

      <VistaTabs vista={vista} onChange={setVista} />

      {vista === 'ordenes' ? (
        <OrdenesView ordenes={ordenes} loading={loadingOrdenes} error={errorOrdenes} />
      ) : (
        <CalendarioView />
      )}
    </div>
  );
}

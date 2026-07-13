'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Clock, Monitor, AlertCircle, ClipboardList, Loader2 } from 'lucide-react';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { getUserName } from '@/lib/auth';

export default function DashboardPage() {
  const [data, setData] = useState({
    totalActivos: 0,
    enMantenimiento: 0,
    operativo: 0,
    fueraDeServicio: 0,
    dadoDeBaja: 0,
    costoEjecutado: 0,
    moneda: 'USD',
    userName: 'Usuario',
    planes: [] as Array<{ id: string; nombre: string; proximaEjecucion: string }>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const empresaId = await requireEmpresaId();
        const base = `/v1/empresas/${empresaId}/activos`;

        const [totalRes, opRes, mantRes, fueraRes, bajaRes] = await Promise.all([
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=operativo`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=en_mantenimiento`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=fuera_de_servicio`),
          fetchWithAuth<{ meta: { total: number } }>(`${base}?limit=1&estado=dado_de_baja`),
        ]);

        let planes: Array<{ id: string; nombre: string; proximaEjecucion: string }> = [];
        try {
          const planesRes = await fetchWithAuth<{
            data: Array<{ id: string; attributes: { nombre: string; proxima_ejecucion: string | null } }>;
          }>(`/v1/empresas/${empresaId}/planes-mantenimiento?limit=5`);
          planes = (planesRes.data ?? [])
            .filter((p) => p.attributes.proxima_ejecucion)
            .sort(
              (a, b) =>
                new Date(a.attributes.proxima_ejecucion!).getTime() -
                new Date(b.attributes.proxima_ejecucion!).getTime(),
            )
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              nombre: p.attributes.nombre,
              proximaEjecucion: p.attributes.proxima_ejecucion!,
            }));
          // ponytail: no asset name resolution, show plan name only. Add when users ask.
        } catch {
          // ponytail: planes are non-critical, silently skip
        }

        let costoEjecutado = 0;
        let moneda = 'USD';
        try {
          const ordsRes = await fetchWithAuth<{
            data: Array<{ attributes: { costo_real: number | null; moneda: string } }>;
          }>(`/v1/empresas/${empresaId}/ordenes-trabajo?limit=100`);
          for (const ot of ordsRes.data ?? []) {
            if (ot.attributes.costo_real) {
              costoEjecutado += ot.attributes.costo_real;
              moneda = ot.attributes.moneda || moneda;
            }
          }
          // ponytail: sums only from first 100 work orders. Add pagination when >100 OTs exist.
        } catch {
          // ponytail: non-critical, show 0
        }

        if (!cancelled) {
          setData({
            totalActivos: totalRes.meta?.total ?? 0,
            enMantenimiento: mantRes.meta?.total ?? 0,
            operativo: opRes.meta?.total ?? 0,
            fueraDeServicio: fueraRes.meta?.total ?? 0,
            dadoDeBaja: bajaRes.meta?.total ?? 0,
            costoEjecutado: Math.round(costoEjecutado * 100) / 100,
            moneda,
            userName: getUserName() ?? 'Usuario',
            planes,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar datos');
          setLoading(false);
        }
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  function pct(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  if (error) {
    return (
      <div className="flex-1 bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const total = data.totalActivos;
  const mantPct = pct(data.enMantenimiento, total);

  return (
    <div className="flex-1 bg-white p-8 overflow-y-auto">
      
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            {loading ? 'Cargando...' : `Hola, ${data.userName}!`}
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-6">Resumen operativo</h2>
          <p className="text-gray-500 text-sm">Vista general del estado actual de los activos</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400"/>
            </div>
            <input 
              type="text" 
              placeholder="Buscar activo..." 
              className="pl-10 pr-4 py-2 bg-[#F8F6F4] border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-[#ECA03C] outline-none"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <Bell className="w-6 h-6 text-gray-600" strokeWidth={1.5}/>
          </button>
          <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
            <User className="w-6 h-6 text-gray-600" strokeWidth={1.5}/>
          </button>
        </div>
      </header>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-[#EAE1D0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Total activos</h3>
            <div className="text-5xl font-bold text-gray-900">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : total}
            </div>
          </div>
        </div>

        
        <div className="bg-[#EAE1D0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">En mantenimiento</h3>
            <div className="text-5xl font-bold text-gray-900">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : data.enMantenimiento}
            </div>
          </div>
          <div>
            <div className="w-full bg-white rounded-full h-3 mb-2 border border-gray-300">
              <div
                className="bg-gradient-to-r from-[#8B4513] to-white h-3 rounded-full"
                style={{ width: `${Math.min(mantPct, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-800">
              {loading ? '...' : `${mantPct}% del total en mantenimiento`}
            </p>
          </div>
        </div>

        
        <div className="bg-[#EAE1D0] rounded-3xl p-6 shadow-sm flex flex-col justify-between h-56">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Costo ejecutado en OTs</h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : `${data.costoEjecutado}${data.moneda === 'USD' ? '$' : ` ${data.moneda}`}`}
            </div>
          </div>
          {/* ponytail: sin "disponible" — no hay módulo de presupuesto en backend */}
        </div>
      </div>

      
      <div className="flex flex-col space-y-6 pb-8">
        
        <div className="bg-white border border-[#EAE1D0] rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="text-blue-600">
                <Clock className="w-7 h-7" strokeWidth={2}/>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Próximos mantenimientos preventivos</h3>
            </div>
            <Link
              href="/reportes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B5E3C] hover:text-[#6d4a2f] transition-colors whitespace-nowrap"
            >
              <ClipboardList className="w-4 h-4" aria-hidden />
              Ver reportes
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : data.planes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay mantenimientos programados</p>
          ) : (
            <div className="space-y-3">
              {data.planes.map((plan) => (
                <div key={plan.id} className="bg-[#EAE1D0]/40 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm">
                      <Monitor className="w-6 h-6 text-blue-500" strokeWidth={1.5}/>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">{plan.nombre}</p>
                      <p className="text-xs text-gray-600 font-medium">Programado: {formatDate(plan.proximaEjecucion)}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 font-bold hover:text-blue-800 text-sm px-4">
                    Asignar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-[#EAE1D0] rounded-[2rem] p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-8">
            <div className="text-[#FF6B00]">
              <AlertCircle className="w-7 h-7" strokeWidth={2}/>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Estado de activos</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8 pl-4 pr-12">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium text-lg">Operativo</span>
                    <span className="text-gray-900 font-bold text-lg">{pct(data.operativo, total)}%</span>
                  </div>
                  <div className="w-full bg-[#E8F5E9] rounded-full h-4">
                    <div
                      className="bg-[#00897B] h-4 rounded-full"
                      style={{ width: `${Math.min(pct(data.operativo, total), 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium text-lg">En mantenimiento</span>
                    <span className="text-gray-900 font-bold text-lg">{pct(data.enMantenimiento, total)}%</span>
                  </div>
                  <div className="w-full bg-[#FFE0B2] rounded-full h-4">
                    <div
                      className="bg-[#FF6B00] h-4 rounded-full"
                      style={{ width: `${Math.min(pct(data.enMantenimiento, total), 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-900 font-medium text-lg">Fuera de servicio</span>
                    <span className="text-gray-900 font-bold text-lg">{pct(data.fueraDeServicio, total)}%</span>
                  </div>
                  <div className="w-full bg-[#FFCDD2] rounded-full h-4">
                    <div
                      className="bg-[#E53935] h-4 rounded-full"
                      style={{ width: `${Math.min(pct(data.fueraDeServicio, total), 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {(() => {
                const mantPct = pct(data.enMantenimiento, total);
                const fueraPct = pct(data.fueraDeServicio, total);
                let msg = '';
                let bgColor = 'bg-[#FFEBE5]';
                if (fueraPct > 10) {
                  msg = `${fueraPct}% de los activos están fuera de servicio. Requiere atención inmediata.`;
                  bgColor = 'bg-red-100';
                } else if (mantPct > 20) {
                  msg = `${mantPct}% de los activos están en mantenimiento. Revise las órdenes de trabajo pendientes.`;
                } else if (data.enMantenimiento > 0) {
                  msg = `${data.enMantenimiento} activo(s) en mantenimiento (${mantPct}% del total). Sin novedades críticas.`;
                  bgColor = 'bg-blue-50';
                }
                return msg ? (
                  <div className={`${bgColor} rounded-2xl p-5 flex items-start space-x-3 mx-4`}>
                    <AlertCircle className="w-6 h-6 text-[#FF6B00] flex-shrink-0 mt-0.5" strokeWidth={2}/>
                    <p className="text-sm text-[#D84315] leading-relaxed">
                      <span className="font-bold">{fueraPct > 10 ? 'Alerta:' : 'Atención:'}</span> {msg}
                    </p>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

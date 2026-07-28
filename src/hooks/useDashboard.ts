import { useEffect, useState } from 'react';
import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import { getReportes } from '@/services/reportes';
import { getRoles } from '@/lib/auth';
import { hasPermisoAccion } from '@/lib/permisos-rbac';

export interface PlanRow {
  id: string;
  nombre: string;
  proximaEjecucion: string;
}

export interface DashboardData {
  totalActivos: number;
  enMantenimiento: number;
  operativo: number;
  fueraDeServicio: number;
  dadoDeBaja: number;
  costoEjecutado: number;
  moneda: string;
  otsAbiertas: number;
  repuestosBajoMinimo: number;
  reportesPendientes: number;
  planes: PlanRow[];
}

interface DashboardResumenResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      total_activos: number;
      activos_operativos: number;
      activos_en_mantenimiento: number;
      activos_fuera_de_servicio: number;
      activos_dados_de_baja: number;
      total_ots: number;
      ots_abiertas: number;
      ots_en_proceso: number;
      ots_cerradas: number;
      costo_real_acumulado: number;
      repuestos_bajo_minimo: number;
    };
  };
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalActivos: 0,
    enMantenimiento: 0,
    operativo: 0,
    fueraDeServicio: 0,
    dadoDeBaja: 0,
    costoEjecutado: 0,
    moneda: 'USD',
    otsAbiertas: 0,
    repuestosBajoMinimo: 0,
    reportesPendientes: 0,
    planes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const empresaId = await requireEmpresaId();
        
        const roles = getRoles();
        const role = roles.length > 0 ? roles[0] : 'consultor';
        const canViewMantenimiento = hasPermisoAccion(role, 'mantenimiento', 'view');

        const resumenPromise = fetchWithAuth<DashboardResumenResponse>(
          `/v1/empresas/${empresaId}/dashboard/resumen`,
        ).catch(() => null);

        const [resumenRes, planes, reportesPendientes] = await Promise.all([
          resumenPromise,
          canViewMantenimiento ? fetchPlanes(empresaId) : Promise.resolve([]),
          canViewMantenimiento ? fetchReportesPendientes() : Promise.resolve(0),
        ]);

        if (!cancelled) {
          const a = resumenRes?.data?.attributes ?? {
            total_activos: 0,
            activos_operativos: 0,
            activos_en_mantenimiento: 0,
            activos_fuera_de_servicio: 0,
            activos_dados_de_baja: 0,
            total_ots: 0,
            ots_abiertas: 0,
            ots_en_proceso: 0,
            ots_cerradas: 0,
            costo_real_acumulado: 0,
            repuestos_bajo_minimo: 0,
          };
          setData({
            totalActivos: a.total_activos,
            enMantenimiento: a.activos_en_mantenimiento,
            operativo: a.activos_operativos,
            fueraDeServicio: a.activos_fuera_de_servicio,
            dadoDeBaja: a.activos_dados_de_baja,
            costoEjecutado: a.costo_real_acumulado,
            moneda: 'USD',
            otsAbiertas: a.ots_abiertas + a.ots_en_proceso,
            repuestosBajoMinimo: a.repuestos_bajo_minimo,
            reportesPendientes,
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

  return { data, loading, error };
}

async function fetchPlanes(empresaId: string): Promise<PlanRow[]> {
  try {
    const res = await fetchWithAuth<{
      data: Array<{ id: string; attributes: { nombre: string; proxima_ejecucion: string | null } }>;
    }>(`/v1/empresas/${empresaId}/planes-mantenimiento?limit=5`);
    return (res.data ?? [])
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
  } catch {
    return [];
  }
}

async function fetchReportesPendientes(): Promise<number> {
  try {
    const { meta } = await getReportes({ status: 'pendiente', perPage: 1 });
    return meta.total;
  } catch {
    return 0;
  }
}

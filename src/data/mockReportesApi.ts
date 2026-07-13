import {
  buildReporteFromInput,
  computeReportesStats,
  filterReportes,
  paginateReportes,
} from '@/lib/reportes';
import { MOCK_REPORTES } from '@/data/mockReportes';
import type {
  NuevoReporteInput,
  Reporte,
  ReportesQuery,
  ReportesResumen,
  ReportesResponse,
} from '@/types/reporte';

let mockStore: Reporte[] = [...MOCK_REPORTES];

export function resetMockReportesStore(): void {
  mockStore = [...MOCK_REPORTES];
}

/** Simula GET /mantenimiento/reportes?page&search&tipo&estado */
export function mockFetchReportes(query: ReportesQuery = {}): ReportesResponse {
  const page = query.page ?? 1;
  const perPage = query.perPage ?? 15;
  const tipo = query.tipo ?? 'todos';

  const filtered = filterReportes(mockStore, tipo, query.search, query.estado);
  return paginateReportes(filtered, page, perPage);
}

/** Simula GET /mantenimiento/reportes/resumen */
export function mockFetchReportesResumen(): ReportesResumen {
  return computeReportesStats(mockStore);
}

/** Simula POST /mantenimiento/reportes */
export function mockCreateReporte(input: NuevoReporteInput): Reporte {
  const nuevo = buildReporteFromInput(input, mockStore.length + 1);
  mockStore = [nuevo, ...mockStore];
  return nuevo;
}

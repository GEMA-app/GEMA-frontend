import type {
  Reporte,
  ReporteEstado,
  ReporteFiltroTipo,
  ReportePrioridad,
  ReporteTipo,
  ReportesMeta,
  ReportesResumen,
  NuevoReporteInput,
} from '@/types/reporte';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

export function normalizeReporteTipo(value: unknown): ReporteTipo {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw.includes('prevent')) return 'preventivo';
  return 'correctivo';
}

export function normalizeReportePrioridad(value: unknown): ReportePrioridad {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw.includes('alt') || raw === 'high' || raw === 'critica' || raw === 'crítica') {
    return 'alta';
  }
  if (raw.includes('baj') || raw === 'low') {
    return 'baja';
  }
  return 'media';
}

export function normalizeReporteEstado(value: unknown): ReporteEstado {
  const raw = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  if (raw.includes('complet') || raw === 'done' || raw === 'cerrado') {
    return 'completado';
  }
  if (raw.includes('proceso') || raw === 'in_progress' || raw === 'en_curso') {
    return 'en_proceso';
  }
  return 'programado';
}

function pickAsignado(reporte: Record<string, unknown>): string {
  const tecnico = asRecord(reporte.tecnico) ?? asRecord(reporte.usuario_asignado);
  const asignado =
    reporte.asignado ??
    reporte.asignado_a ??
    reporte.responsable ??
    tecnico?.name ??
    tecnico?.nombre;

  return String(asignado ?? 'Sin asignar').toUpperCase();
}

function pickTitulo(reporte: Record<string, unknown>): string {
  const activo = asRecord(reporte.activo);
  const raw =
    reporte.titulo ??
    reporte.title ??
    activo?.nombre ??
    activo?.name ??
    reporte.nombre ??
    'SIN TÍTULO';

  return String(raw).toUpperCase();
}

function pickCodigo(reporte: Record<string, unknown>): string {
  const id = reporte.id ?? reporte.codigo_reporte;
  const codigo = reporte.codigo ?? reporte.code;

  if (typeof codigo === 'string' && codigo.trim()) {
    return codigo.startsWith('#') ? codigo : `#${codigo}`;
  }

  return `#${String(id ?? '0000').padStart(4, '0')}`;
}

export function mapReporteFromApi(item: unknown): Reporte | null {
  const reporte = asRecord(item);
  if (!reporte?.id && !reporte?.codigo) {
    return null;
  }

  const titulo = pickTitulo(reporte);

  return {
    id: String(reporte.id ?? reporte.codigo ?? ''),
    codigo: pickCodigo(reporte),
    titulo,
    descripcion: String(
      reporte.descripcion ?? reporte.description ?? reporte.detalle ?? '',
    ),
    tipo: normalizeReporteTipo(
      reporte.tipo ?? reporte.tipo_mantenimiento ?? reporte.type,
    ),
    prioridad: normalizeReportePrioridad(reporte.prioridad ?? reporte.priority),
    estado: normalizeReporteEstado(reporte.estado ?? reporte.status),
    asignado: pickAsignado(reporte),
  };
}

export function mapReportesFromResponse(
  payload: unknown,
  page = 1,
  perPage = 15,
): { reportes: Reporte[]; meta: ReportesMeta } {
  if (!payload || typeof payload !== 'object') {
    return { reportes: [], meta: { page, perPage, total: 0, lastPage: 1 } };
  }

  const record = payload as Record<string, unknown>;
  const data = Array.isArray(record.data) ? record.data : [];
  const meta = asRecord(record.meta);

  const reportes = data
    .map((item) => mapReporteFromApi(item))
    .filter((item): item is Reporte => item !== null);

  const total =
    (typeof meta?.total === 'number' && meta.total) ||
    reportes.length;

  const lastPage =
    (typeof meta?.last_page === 'number' && meta.last_page) ||
    Math.max(1, Math.ceil(total / perPage));

  return {
    reportes,
    meta: {
      page: (typeof meta?.current_page === 'number' && meta.current_page) || page,
      perPage: (typeof meta?.per_page === 'number' && meta.per_page) || perPage,
      total,
      lastPage,
    },
  };
}

export function mapReporteResponse(payload: unknown): Reporte | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  return mapReporteFromApi(record.data ?? record);
}

export function mapReportesResumenFromResponse(payload: unknown): ReportesResumen | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const data = (record.data ?? record) as Record<string, unknown>;

  const alertasCriticas =
    data.alertas_criticas ??
    data.alertasCriticas ??
    data.alertas ??
    data.criticas;

  const enProceso = data.en_proceso ?? data.enProceso ?? data.en_proceso_total;
  const completados = data.completados ?? data.completado ?? data.completados_total;

  if (
    typeof alertasCriticas !== 'number' ||
    typeof enProceso !== 'number' ||
    typeof completados !== 'number'
  ) {
    return null;
  }

  return {
    alertasCriticas,
    enProceso,
    completados,
  };
}

export function filterReportes(
  reportes: Reporte[],
  tipo: ReporteFiltroTipo,
  search = '',
  estado?: ReporteEstado,
): Reporte[] {
  const query = search.trim().toLowerCase();

  return reportes.filter((reporte) => {
    const matchesTipo = tipo === 'todos' || reporte.tipo === tipo;
    const matchesEstado = !estado || reporte.estado === estado;
    const matchesSearch =
      !query ||
      reporte.codigo.toLowerCase().includes(query) ||
      reporte.titulo.toLowerCase().includes(query) ||
      reporte.asignado.toLowerCase().includes(query);

    return matchesTipo && matchesEstado && matchesSearch;
  });
}

export function paginateReportes(
  reportes: Reporte[],
  page: number,
  perPage: number,
): { reportes: Reporte[]; meta: ReportesMeta } {
  const total = reportes.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(page, 1), lastPage);
  const start = (safePage - 1) * perPage;

  return {
    reportes: reportes.slice(start, start + perPage),
    meta: {
      page: safePage,
      perPage,
      total,
      lastPage,
    },
  };
}

export function computeReportesStats(reportes: Reporte[]): ReportesResumen {
  return {
    alertasCriticas: reportes.filter((reporte) => reporte.prioridad === 'alta').length,
    enProceso: reportes.filter((reporte) => reporte.estado === 'en_proceso').length,
    completados: reportes.filter((reporte) => reporte.estado === 'completado').length,
  };
}

export function buildReporteFromInput(input: NuevoReporteInput, index: number): Reporte {
  return {
    id: String(Date.now()),
    codigo: `#${String(1000 + index).padStart(4, '0')}`,
    titulo: input.titulo.toUpperCase(),
    descripcion: input.descripcion,
    tipo: input.tipo,
    prioridad: input.prioridad,
    estado: 'programado',
    asignado: input.asignado.toUpperCase(),
  };
}

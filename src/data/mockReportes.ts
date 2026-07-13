import type { Reporte, ReportesResumen } from '@/types/reporte';

export const MOCK_REPORTES: Reporte[] = [
  {
    id: '1',
    codigo: '#1234',
    titulo: 'SERVIDOR 123',
    descripcion: 'Restauración de conectores',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'completado',
    asignado: 'JUAN PEREZ',
  },
  {
    id: '2',
    codigo: '#6789',
    titulo: 'AIRE ACONDICIONADO',
    descripcion: 'Fallo del compresor',
    tipo: 'correctivo',
    prioridad: 'media',
    estado: 'en_proceso',
    asignado: 'MARCOS RUIZ',
  },
  {
    id: '3',
    codigo: '#4521',
    titulo: 'UPS LABORATORIO B',
    descripcion: 'Reemplazo de baterías',
    tipo: 'preventivo',
    prioridad: 'baja',
    estado: 'programado',
    asignado: 'JUAN GARCIA',
  },
  {
    id: '4',
    codigo: '#9012',
    titulo: 'SWITCH PISO 3',
    descripcion: 'Actualización de firmware',
    tipo: 'preventivo',
    prioridad: 'media',
    estado: 'programado',
    asignado: 'ADRIAN PEÑA',
  },
  {
    id: '5',
    codigo: '#3344',
    titulo: 'GENERADOR PRINCIPAL',
    descripcion: 'Fuga de refrigerante',
    tipo: 'correctivo',
    prioridad: 'alta',
    estado: 'en_proceso',
    asignado: 'JUAN PEREZ',
  },
];

export function getMockReportesResumen(reportes: Reporte[] = MOCK_REPORTES): ReportesResumen {
  return {
    alertasCriticas: reportes.filter((reporte) => reporte.prioridad === 'alta').length,
    enProceso: reportes.filter((reporte) => reporte.estado === 'en_proceso').length,
    completados: reportes.filter((reporte) => reporte.estado === 'completado').length,
  };
}

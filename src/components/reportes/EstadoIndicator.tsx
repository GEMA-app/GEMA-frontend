import { Badge } from '@/components/ui/Badge';
import type { ReporteEstado } from '@/types/reporte';

interface EstadoIndicatorProps {
  estado: ReporteEstado;
}

export function EstadoIndicator({ estado }: EstadoIndicatorProps) {
  const badgeEstado =
    estado === 'atendido' ? 'resuelto' : estado === 'descartado' ? 'cancelado' : estado;
  return <Badge estado={badgeEstado} />;
}
export function formatRelativeTime(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const diffMs = Date.now() - date.getTime();

  if (diffMs < 0) {
    return 'Ahora';
  }

  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) {
    return 'Ahora';
  }
  if (minutes < 60) {
    return `Hace ${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Hace ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `Hace ${days}d`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return `Hace ${weeks}sem`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `Hace ${months}mes`;
  }

  const years = Math.floor(days / 365);
  return `Hace ${years}a`;
}

export function formatFechaAbsoluta(fecha: string | Date): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

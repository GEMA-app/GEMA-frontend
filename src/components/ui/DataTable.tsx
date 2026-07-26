import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No hay datos para mostrar.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gema-primary/10 dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gema-bg-light dark:bg-gema-surface-dark-2 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gema-primary/60 dark:text-white/50 ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gema-primary/5 dark:divide-white/5 bg-white dark:bg-gema-surface-dark">
          {loading ? (
            <tr aria-busy="true">
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <Loader2
                  size={20}
                  className="mx-auto animate-spin text-gema-primary/40 dark:text-white/40"
                />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                role="status"
                className="px-4 py-10 text-center text-sm text-gema-primary/50 dark:text-white/40"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                className="transition-colors hover:bg-gema-bg-light/60 dark:hover:bg-white/5"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3.5 text-gema-primary/80 dark:text-white/80 ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

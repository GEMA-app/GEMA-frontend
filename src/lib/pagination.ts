import type { PaginationMeta } from '@/types/common';

export function buildOffsetQuery(params: {
  page?: number;
  perPage?: number;
  [key: string]: string | number | undefined;
}): string {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 15;
  const offset = (page - 1) * perPage;

  const searchParams = new URLSearchParams();
  searchParams.set('offset', String(offset));
  searchParams.set('limit', String(perPage));

  for (const [key, value] of Object.entries(params)) {
    if (key === 'page' || key === 'perPage') continue;
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  return `?${searchParams.toString()}`;
}

function calcMeta(total: number, page: number, perPage: number): PaginationMeta {
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  return { page, perPage, total, lastPage };
}

export function extractMetaFromResponse(
  payload: unknown,
  fallbackPage: number = 1,
  fallbackPerPage: number = 15,
): PaginationMeta {
  if (!payload || typeof payload !== 'object') {
    return calcMeta(0, fallbackPage, fallbackPerPage);
  }

  const record = payload as Record<string, unknown>;
  const meta =
    (record.meta && typeof record.meta === 'object' ? (record.meta as Record<string, unknown>) : null) ??
    (record.pagination && typeof record.pagination === 'object'
      ? (record.pagination as Record<string, unknown>)
      : null);

  if (!meta) {
    const data = Array.isArray(record.data) ? record.data : [];
    return calcMeta(data.length, fallbackPage, fallbackPerPage);
  }

  const total =
    typeof meta.total === 'number'
      ? meta.total
      : typeof meta.total_count === 'number'
        ? meta.total_count
        : Array.isArray(record.data)
          ? record.data.length
          : 0;

  const page =
    typeof meta.page === 'number'
      ? meta.page
      : typeof meta.current_page === 'number'
        ? meta.current_page
        : fallbackPage;

  const perPage =
    typeof meta.per_page === 'number'
      ? meta.per_page
      : typeof meta.limit === 'number'
        ? meta.limit
        : fallbackPerPage;

  return calcMeta(total, page, perPage);
}

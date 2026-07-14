import { fetchWithAuth, requireEmpresaId } from '@/lib/api';
import type { CatalogArticleResponse } from '@/types/activo';

export async function getCatalogArticle(id: string): Promise<CatalogArticleResponse> {
  const empresaId = await requireEmpresaId();
  const res = await fetchWithAuth<{ data: { id: string; attributes: Record<string, unknown> } }>(
    `/v1/empresas/${empresaId}/catalogo/articulos/${id}`,
  );
  const a = res.data.attributes;
  return {
    id: res.data.id,
    name: a.name as string,
    manufacturer: (a.manufacturer as string) || null,
    model: (a.model as string) || null,
  };
}

export async function findOrCreateCatalogArticle(
  nombre: string,
  marca: string,
): Promise<string> {
  const empresaId = await requireEmpresaId();

  const searchResult = await fetchWithAuth<{ data: Array<{ id: string }> }>(
    `/v1/empresas/${empresaId}/catalogo/articulos?search=${encodeURIComponent(nombre)}&limit=1`,
  );

  if (searchResult.data?.length > 0) {
    return searchResult.data[0].id;
  }

  const created = await fetchWithAuth<{ data: { id: string } }>(
    `/v1/empresas/${empresaId}/catalogo/articulos`,
    {
      method: 'POST',
      contentType: 'json-api',
      json: {
        data: {
          type: 'catalog-articles',
          attributes: {
            name: nombre,
            manufacturer: marca || null,
            model: nombre,
          },
        },
      },
    },
  );
  return created.data.id;
}

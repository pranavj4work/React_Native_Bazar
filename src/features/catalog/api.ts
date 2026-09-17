import { apiRequest } from '../../shared/api/client';
import type { DummyCategory, DummyProduct, ProductPage } from '../../shared/api/types';

const PAGE_SIZE = 20;

export function fetchProductPage(params: {
  skip: number;
  q: string;
  category: string;
}): Promise<ProductPage> {
  const search = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(params.skip),
  });

  if (params.q) {
    search.set('q', params.q);
    return apiRequest<ProductPage>(`/products/search?${search.toString()}`);
  }

  if (params.category) {
    return apiRequest<ProductPage>(`/products/category/${params.category}?${search.toString()}`);
  }

  return apiRequest<ProductPage>(`/products?${search.toString()}`);
}

export function fetchProduct(id: number): Promise<DummyProduct> {
  return apiRequest<DummyProduct>(`/products/${id}`);
}

export async function fetchCategories(): Promise<DummyCategory[]> {
  const data = await apiRequest<unknown>('/products/categories');
  if (!Array.isArray(data)) return [];
  return data.map((entry) => {
    if (typeof entry === 'string') {
      return { slug: entry, name: titleCase(entry), url: '' };
    }
    const record = entry as { slug?: string; name?: string; url?: string };
    const slug = record.slug ?? '';
    return {
      slug,
      name: record.name ?? titleCase(slug),
      url: record.url ?? '',
    };
  }).filter((item) => item.slug.length > 0);
}

function titleCase(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

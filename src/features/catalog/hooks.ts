import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../shared/api/queryKeys';
import { fetchCategories, fetchProduct, fetchProductPage } from './api';

export function useProductFeed(filters: { q: string; category: string }) {
  return useInfiniteQuery({
    queryKey: queryKeys.products(filters),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchProductPage({ skip: pageParam, q: filters.q, category: filters.category }),
    getNextPageParam: (lastPage) => {
      const next = lastPage.skip + lastPage.products.length;
      return next < lastPage.total ? next : undefined;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => fetchProduct(id),
    enabled: Number.isFinite(id) && id > 0,
  });
}

export const queryKeys = {
  products: (filters: { q: string; category: string }) => ['products', filters] as const,
  product: (id: number) => ['product', id] as const,
  categories: ['categories'] as const,
  me: ['me'] as const,
};

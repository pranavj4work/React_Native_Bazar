export type CartItem = {
  productId: number;
  title: string;
  thumbnail: string;
  priceInr: number;
  quantity: number;
  stock: number;
};

export function addItem(
  items: CartItem[],
  incoming: Omit<CartItem, 'quantity'> & { quantity?: number },
): CartItem[] {
  const qty = incoming.quantity ?? 1;
  const existing = items.find((item) => item.productId === incoming.productId);
  if (!existing) {
    return [...items, { ...incoming, quantity: clamp(qty, 1, incoming.stock) }];
  }
  return items.map((item) =>
    item.productId === incoming.productId
      ? { ...item, quantity: clamp(item.quantity + qty, 1, item.stock) }
      : item,
  );
}

export function setQuantity(items: CartItem[], productId: number, quantity: number): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.productId !== productId);
  }
  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: clamp(quantity, 1, item.stock) } : item,
  );
}

export function removeItem(items: CartItem[], productId: number): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.priceInr * item.quantity, 0);
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

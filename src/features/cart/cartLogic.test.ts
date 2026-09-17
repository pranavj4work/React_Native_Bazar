import { addItem, cartCount, cartSubtotal, removeItem, setQuantity, type CartItem } from './cartLogic';

const phone: CartItem = {
  productId: 1,
  title: 'Phone',
  thumbnail: 'https://example.com/p.png',
  priceInr: 1000,
  quantity: 1,
  stock: 3,
};

describe('cartLogic', () => {
  it('adds a new line and increments an existing one up to stock', () => {
    const withPhone = addItem([], phone);
    expect(withPhone).toHaveLength(1);
    expect(withPhone[0].quantity).toBe(1);

    const incremented = addItem(withPhone, { ...phone, quantity: 2 });
    expect(incremented[0].quantity).toBe(3);

    const capped = addItem(incremented, phone);
    expect(capped[0].quantity).toBe(3);
  });

  it('removes a line when quantity hits zero', () => {
    const items = setQuantity([phone], 1, 0);
    expect(items).toEqual([]);
  });

  it('removes by id and totals quantity and money', () => {
    const items: CartItem[] = [
      phone,
      { ...phone, productId: 2, quantity: 2, priceInr: 250 },
    ];
    expect(cartCount(items)).toBe(3);
    expect(cartSubtotal(items)).toBe(1500);
    expect(removeItem(items, 1)).toHaveLength(1);
  });
});

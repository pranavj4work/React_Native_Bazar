import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { STORAGE_KEYS } from '../../shared/storage/keys';
import type { CartItem } from '../cart/cartLogic';
import { cartSubtotal } from '../cart/cartLogic';
import {
  createOrderId,
  type Address,
  type Order,
  type PaymentMethod,
} from '../checkout/schema';

type PlaceOrderInput = {
  userId: number;
  items: CartItem[];
  address: Address;
  paymentMethod: PaymentMethod;
};

type OrderState = {
  orders: Order[];
  hydrate: () => Promise<void>;
  placeOrder: (input: PlaceOrderInput) => Order;
};

async function persist(orders: Order[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.orders);
    if (!raw) return;
    try {
      const orders = JSON.parse(raw) as Order[];
      if (Array.isArray(orders)) set({ orders });
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEYS.orders);
    }
  },
  placeOrder: (input) => {
    const order: Order = {
      id: createOrderId(),
      userId: input.userId,
      items: input.items,
      address: input.address,
      paymentMethod: input.paymentMethod,
      status: 'placed',
      subtotal: cartSubtotal(input.items),
      createdAt: new Date().toISOString(),
    };
    const orders = [order, ...get().orders];
    set({ orders });
    void persist(orders);
    return order;
  },
}));

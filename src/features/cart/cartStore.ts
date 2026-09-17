import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { STORAGE_KEYS } from '../../shared/storage/keys';
import {
  addItem,
  cartCount,
  cartSubtotal,
  removeItem,
  setQuantity,
  type CartItem,
} from './cartLogic';

type CartState = {
  items: CartItem[];
  hydrate: () => Promise<void>;
  add: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  setQty: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

async function persist(items: CartItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(items));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) return;
    try {
      const items = JSON.parse(raw) as CartItem[];
      if (Array.isArray(items)) set({ items });
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEYS.cart);
    }
  },
  add: (item) => {
    const items = addItem(get().items, item);
    set({ items });
    void persist(items);
  },
  setQty: (productId, quantity) => {
    const items = setQuantity(get().items, productId, quantity);
    set({ items });
    void persist(items);
  },
  remove: (productId) => {
    const items = removeItem(get().items, productId);
    set({ items });
    void persist(items);
  },
  clear: () => {
    set({ items: [] });
    void persist([]);
  },
}));

export function useCartCount(): number {
  return useCartStore((state) => cartCount(state.items));
}

export function useCartSubtotal(): number {
  return useCartStore((state) => cartSubtotal(state.items));
}

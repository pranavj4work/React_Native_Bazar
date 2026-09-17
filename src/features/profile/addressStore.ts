import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { STORAGE_KEYS } from '../../shared/storage/keys';
import type { Address } from '../checkout/schema';

type AddressState = {
  address: Address | null;
  hydrate: () => Promise<void>;
  save: (address: Address) => void;
};

export const useAddressStore = create<AddressState>((set) => ({
  address: null,
  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.address);
    if (!raw) return;
    try {
      set({ address: JSON.parse(raw) as Address });
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEYS.address);
    }
  },
  save: (address) => {
    set({ address });
    void AsyncStorage.setItem(STORAGE_KEYS.address, JSON.stringify(address));
  },
}));

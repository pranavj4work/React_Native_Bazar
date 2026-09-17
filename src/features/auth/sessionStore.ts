import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { ApiError, bindAuth } from '../../shared/api/client';
import type { DummyUser } from '../../shared/api/types';
import { STORAGE_KEYS } from '../../shared/storage/keys';
import { fetchMe, loginRequest, type LoginForm } from './api';

type SessionPersist = {
  user: DummyUser;
  accessToken: string;
  refreshToken: string;
};

type SessionState = {
  user: DummyUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (values: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.session);
      if (!raw) {
        set({ isHydrated: true });
        return;
      }
      const parsed = JSON.parse(raw) as SessionPersist;
      set({
        user: parsed.user,
        accessToken: parsed.accessToken,
        refreshToken: parsed.refreshToken,
      });
      try {
        const me = await fetchMe();
        const next: SessionPersist = {
          user: me,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(next));
        set({ user: me });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          await get().logout();
        }
      }
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEYS.session);
    } finally {
      set({ isHydrated: true });
    }
  },
  login: async (values) => {
    const response = await loginRequest(values);
    const persist: SessionPersist = {
      user: {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        gender: response.gender,
        image: response.image,
      },
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(persist));
    set({
      user: persist.user,
      accessToken: persist.accessToken,
      refreshToken: persist.refreshToken,
    });
  },
  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.session);
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));

bindAuth({
  getAccessToken: () => useSessionStore.getState().accessToken,
  onUnauthorized: () => {
    void useSessionStore.getState().logout();
  },
});

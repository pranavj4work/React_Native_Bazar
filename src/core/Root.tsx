import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from '../features/auth/screens/SplashScreen';
import { useSessionStore } from '../features/auth/sessionStore';
import { useCartStore } from '../features/cart/cartStore';
import { useOrderStore } from '../features/orders/orderStore';
import { useAddressStore } from '../features/profile/addressStore';
import { AppNavigator } from './navigation/AppNavigator';
import { AuthNavigator } from './navigation/AuthNavigator';
import { linking } from './navigation/linking';
import { queryClient } from './queryClient';
import { colors } from '../shared/theme/tokens';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.ink,
    border: colors.line,
    primary: colors.accent,
  },
};

export function Root() {
  const hydrateSession = useSessionStore((state) => state.hydrate);
  const isHydrated = useSessionStore((state) => state.isHydrated);
  const accessToken = useSessionStore((state) => state.accessToken);
  const hydrateCart = useCartStore((state) => state.hydrate);
  const hydrateOrders = useOrderStore((state) => state.hydrate);
  const hydrateAddress = useAddressStore((state) => state.hydrate);

  useEffect(() => {
    void Promise.all([hydrateSession(), hydrateCart(), hydrateOrders(), hydrateAddress()]);
  }, [hydrateAddress, hydrateCart, hydrateOrders, hydrateSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          {!isHydrated ? (
            <SplashScreen />
          ) : (
            <NavigationContainer linking={linking} theme={navigationTheme}>
              {accessToken ? <AppNavigator /> : <AuthNavigator />}
            </NavigationContainer>
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

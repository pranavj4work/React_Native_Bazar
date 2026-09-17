import type { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import type { AppTabParamList } from './types';

export const linking: LinkingOptions<AppTabParamList> = {
  prefixes: [Linking.createURL('/'), 'myapp://', 'rnstore://'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          Catalog: 'catalog',
          Product: {
            path: 'product/:productId',
            parse: {
              productId: Number,
            },
          },
        },
      },
      CartTab: 'cart',
      OrdersTab: 'orders',
      ProfileTab: 'profile',
    },
  },
};

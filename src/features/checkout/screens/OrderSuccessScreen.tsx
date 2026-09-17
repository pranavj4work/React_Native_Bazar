import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';

import type { AppTabParamList, CartStackParamList } from '../../../core/navigation/types';
import { colors, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CartStackParamList, 'OrderSuccess'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export function OrderSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProp<CartStackParamList, 'OrderSuccess'>>();

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Cart' }] });
    navigation.navigate('HomeTab');
  };

  const goOrder = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Cart' }] });
    navigation.navigate('OrdersTab', {
      screen: 'OrderDetail',
      params: { orderId: route.params.orderId },
    });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.kicker}>Order placed</Text>
      <Text style={styles.title}>We got it.</Text>
      <Text style={styles.body}>
        {route.params.orderId} is saved on this device. DummyJSON cannot persist orders, so local
        storage is the honest approach.
      </Text>
      <Button label="View order" onPress={goOrder} />
      <Button label="Continue shopping" variant="secondary" onPress={goHome} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: space.xxl,
    justifyContent: 'center',
    gap: space.md,
  },
  kicker: {
    color: colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: type.xs,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
  },
  body: {
    fontSize: type.md,
    color: colors.inkMuted,
    lineHeight: 22,
    marginBottom: space.md,
  },
});

import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppTabParamList, CartStackParamList } from '../../../core/navigation/types';
import { formatInr } from '../../../shared/formatters/currency';
import { colors, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { CartLineItem } from '../components/CartLineItem';
import { useCartCount, useCartStore, useCartSubtotal } from '../cartStore';

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CartStackParamList>,
  BottomTabNavigationProp<AppTabParamList>
>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const items = useCartStore((state) => state.items);
  const setQty = useCartStore((state) => state.setQty);
  const remove = useCartStore((state) => state.remove);
  const count = useCartCount();
  const subtotal = useCartSubtotal();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        body="Add something from the catalog to check out."
        actionLabel="Browse products"
        onAction={() => navigation.navigate('HomeTab')}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.productId)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <CartLineItem
            item={item}
            onQty={(quantity) => setQty(item.productId, quantity)}
            onRemove={() => remove(item.productId)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      />
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View>
          <Text style={styles.meta}>{count} item{count === 1 ? '' : 's'}</Text>
          <Text style={styles.total}>{formatInr(subtotal)}</Text>
        </View>
        <View style={styles.cta}>
          <Button label="Checkout" onPress={() => navigation.navigate('Checkout')} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: space.lg,
    paddingBottom: space.xxxl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: space.lg,
  },
  meta: {
    color: colors.inkMuted,
    fontSize: type.sm,
  },
  total: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
  },
  cta: {
    flex: 1,
    maxWidth: 180,
  },
});

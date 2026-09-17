import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import type { OrdersStackParamList } from '../../../core/navigation/types';
import { formatInr } from '../../../shared/formatters/currency';
import { formatOrderDate } from '../../../shared/formatters/date';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useSessionStore } from '../../auth/sessionStore';
import { deriveOrderStatus, STATUS_LABEL } from '../../checkout/schema';
import { useOrderStore } from '../orderStore';

export function OrderListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OrdersStackParamList>>();
  const userId = useSessionStore((state) => state.user?.id);
  const allOrders = useOrderStore((state) => state.orders);
  const orders = useMemo(
    () => allOrders.filter((order) => order.userId === userId),
    [allOrders, userId],
  );

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        body="Place an order from checkout. Orders are stored on device, keyed by user."
      />
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const status = deriveOrderStatus(item.createdAt);
        return (
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          >
            <View style={styles.top}>
              <Text style={styles.id}>{item.id}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{STATUS_LABEL[status]}</Text>
              </View>
            </View>
            <Text style={styles.meta}>
              {item.items.length} item{item.items.length === 1 ? '' : 's'} · {formatInr(item.subtotal)}
            </Text>
            <Text style={styles.date}>{formatOrderDate(item.createdAt)}</Text>
          </Pressable>
        );
      }}
      ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: space.lg,
    backgroundColor: colors.bg,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: {
    fontSize: type.md,
    fontWeight: '800',
    color: colors.ink,
  },
  badge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  badgeText: {
    color: colors.accent,
    fontSize: type.xs,
    fontWeight: '700',
  },
  meta: {
    color: colors.ink,
    fontWeight: '600',
  },
  date: {
    color: colors.inkMuted,
    fontSize: type.sm,
  },
});

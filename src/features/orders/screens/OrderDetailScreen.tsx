import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import type { OrdersStackParamList } from '../../../core/navigation/types';
import { formatInr } from '../../../shared/formatters/currency';
import { formatOrderDate } from '../../../shared/formatters/date';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { AddressMap } from '../../../shared/ui/AddressMap';
import {
  deriveOrderStatus,
  PAYMENT_LABEL,
  STATUS_LABEL,
} from '../../checkout/schema';
import { useOrderStore } from '../orderStore';

export function OrderDetailScreen() {
  const route = useRoute<RouteProp<OrdersStackParamList, 'OrderDetail'>>();
  const order = useOrderStore((state) =>
    state.orders.find((item) => item.id === route.params.orderId),
  );

  if (!order) {
    return <EmptyState title="Order not found" body="It may have been cleared from this device." />;
  }

  const status = deriveOrderStatus(order.createdAt);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.kicker}>{STATUS_LABEL[status]}</Text>
      <Text style={styles.title}>{order.id}</Text>
      <Text style={styles.muted}>{formatOrderDate(order.createdAt)}</Text>

      <Text style={styles.section}>Items</Text>
      {order.items.map((item) => (
        <View key={item.productId} style={styles.line}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumb} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.muted}>
              Qty {item.quantity} · {formatInr(item.priceInr * item.quantity)}
            </Text>
          </View>
        </View>
      ))}

      <Text style={styles.section}>Delivery</Text>
      <View style={styles.deliveryCard}>
        <View style={styles.deliveryHead}>
          <View style={styles.pin}>
            <Ionicons name="location-outline" size={18} color={colors.accent} />
          </View>
          <View style={styles.deliveryHeadText}>
            <Text style={styles.deliveryName}>{order.address.fullName}</Text>
            <Text style={styles.deliveryStatus}>{STATUS_LABEL[status]}</Text>
          </View>
        </View>
        <AddressMap
          line1={order.address.line1}
          city={order.address.city}
          pincode={order.address.pincode}
          latitude={order.address.latitude}
          longitude={order.address.longitude}
        />
        <View style={styles.credList}>
          <View style={styles.credRow}>
            <Text style={styles.credLabel}>Street</Text>
            <Text style={styles.credValue}>{order.address.line1}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.credRow}>
            <Text style={styles.credLabel}>City</Text>
            <Text style={styles.credValue}>
              {order.address.city} {order.address.pincode}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.credRow}>
            <Text style={styles.credLabel}>Phone</Text>
            <Text style={styles.credValue}>{order.address.phone}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.section}>Payment</Text>
      <Text style={styles.body}>{PAYMENT_LABEL[order.paymentMethod]}</Text>
      <Text style={styles.total}>{formatInr(order.subtotal)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: space.lg,
    gap: space.sm,
    backgroundColor: colors.bg,
    paddingBottom: space.xxxl,
  },
  kicker: {
    color: colors.accent,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: type.xs,
  },
  title: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
  },
  muted: {
    color: colors.inkMuted,
    fontSize: type.sm,
  },
  section: {
    marginTop: space.md,
    fontSize: type.lg,
    fontWeight: '800',
    color: colors.ink,
  },
  line: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.line,
  },
  itemTitle: {
    fontWeight: '600',
    color: colors.ink,
  },
  deliveryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
  },
  deliveryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryHeadText: {
    flex: 1,
    gap: 2,
  },
  deliveryName: {
    fontSize: type.lg,
    fontWeight: '800',
    color: colors.ink,
  },
  deliveryStatus: {
    fontSize: type.sm,
    fontWeight: '700',
    color: colors.accent,
  },
  credList: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  credRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  credLabel: {
    fontSize: type.sm,
    color: colors.inkMuted,
    fontWeight: '600',
    width: 56,
  },
  credValue: {
    flex: 1,
    fontSize: type.md,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginHorizontal: space.md,
  },
  body: {
    color: colors.ink,
    lineHeight: 22,
  },
  total: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
    marginTop: space.sm,
  },
});

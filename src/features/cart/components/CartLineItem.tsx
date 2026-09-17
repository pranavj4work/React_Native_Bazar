import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatInr } from '../../../shared/formatters/currency';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { QuantityStepper } from '../../../shared/ui/QuantityStepper';
import type { CartItem } from '../cartLogic';

type Props = {
  item: CartItem;
  onQty: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ item, onQty, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumb} contentFit="cover" />
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.price}>{formatInr(item.priceInr)}</Text>
        <View style={styles.actions}>
          <QuantityStepper value={item.quantity} min={0} max={item.stock} onChange={onQty} />
          <Pressable onPress={onRemove}>
            <Text style={styles.remove}>Remove</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: radius.sm,
    backgroundColor: colors.line,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: type.md,
    fontWeight: '600',
    color: colors.ink,
  },
  price: {
    fontSize: type.md,
    fontWeight: '800',
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remove: {
    color: colors.danger,
    fontSize: type.sm,
    fontWeight: '600',
  },
});

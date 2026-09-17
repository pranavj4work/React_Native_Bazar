import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DummyProduct } from '../../../shared/api/types';
import { discountedUsd, formatInr, usdToInr } from '../../../shared/formatters/currency';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

type Props = {
  product: DummyProduct;
  width: number;
  onPress: (productId: number) => void;
};

export const ProductCard = memo(function ProductCard({ product, width, onPress }: Props) {
  const salePrice = usdToInr(discountedUsd(product.price, product.discountPercentage));
  const mrp = usdToInr(product.price);

  return (
    <Pressable
      onPress={() => onPress(product.id)}
      style={[styles.card, { width }]}
      accessibilityRole="button"
      accessibilityLabel={product.title}
    >
      <Image source={{ uri: product.thumbnail }} style={styles.image} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatInr(salePrice)}</Text>
          {salePrice < mrp ? <Text style={styles.mrp}>{formatInr(mrp)}</Text> : null}
        </View>
        <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.line,
  },
  body: {
    padding: space.sm,
    gap: 4,
  },
  title: {
    fontSize: type.sm,
    fontWeight: '600',
    color: colors.ink,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: type.md,
    fontWeight: '800',
    color: colors.ink,
  },
  mrp: {
    fontSize: type.xs,
    color: colors.inkSubtle,
    textDecorationLine: 'line-through',
  },
  rating: {
    fontSize: type.xs,
    color: colors.star,
    fontWeight: '600',
  },
});

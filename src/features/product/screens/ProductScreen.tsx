import { useNavigation, useRoute, type CompositeNavigationProp, type RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { AppTabParamList, HomeStackParamList } from '../../../core/navigation/types';
import { discountedUsd, formatInr, usdToInr } from '../../../shared/formatters/currency';
import { colors, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { EmptyState, ErrorState } from '../../../shared/ui/EmptyState';
import { QuantityStepper } from '../../../shared/ui/QuantityStepper';
import { Skeleton } from '../../../shared/ui/Skeleton';
import { useCartStore } from '../../cart/cartStore';
import { useProduct } from '../../catalog/hooks';

const { width } = Dimensions.get('window');

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Product'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export function ProductScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'Product'>>();
  const navigation = useNavigation<Nav>();
  const productId = Number(route.params.productId);
  const productQuery = useProduct(productId);
  const add = useCartStore((state) => state.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [productId]);

  if (productQuery.isPending) {
    return (
      <View style={styles.screen}>
        <Skeleton height={width * 0.85} borderRadius={0} />
        <View style={styles.body}>
          <Skeleton height={24} width="70%" />
          <Skeleton height={18} width="40%" />
          <Skeleton height={80} />
        </View>
      </View>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        message={productQuery.error instanceof Error ? productQuery.error.message : undefined}
        onRetry={() => void productQuery.refetch()}
      />
    );
  }

  const product = productQuery.data;
  const salePrice = usdToInr(discountedUsd(product.price, product.discountPercentage));
  const mrp = usdToInr(product.price);
  const images = product.images.length > 0 ? product.images : [product.thumbnail];
  const inStock = product.stock > 0;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const next = Math.round(event.nativeEvent.contentOffset.x / width);
              if (next !== page) setPage(next);
            }}
            scrollEventThrottle={16}
          >
            {images.map((uri, index) => (
              <Image key={`${uri}-${index}`} source={{ uri }} style={styles.hero} contentFit="cover" />
            ))}
          </ScrollView>
          {images.length > 1 ? (
            <View style={styles.dots} pointerEvents="none">
              <View style={styles.dotsInner}>
                {images.map((_, index) => (
                  <View key={index} style={[styles.dot, index === page ? styles.dotActive : null]} />
                ))}
              </View>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
            <Text style={styles.stock}>{inStock ? `${product.stock} in stock` : 'Out of stock'}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatInr(salePrice)}</Text>
            {salePrice < mrp ? <Text style={styles.mrp}>{formatInr(mrp)}</Text> : null}
          </View>
          <Text style={styles.description}>{product.description}</Text>
          {inStock ? (
            <View style={styles.qty}>
              <Text style={styles.qtyLabel}>Quantity</Text>
              <QuantityStepper value={qty} max={product.stock} onChange={setQty} />
            </View>
          ) : (
            <EmptyState title="Out of stock" body="This item is currently unavailable." />
          )}
        </View>
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          label={added ? 'Added to cart' : `Add to cart · ${formatInr(salePrice * qty)}`}
          disabled={!inStock}
          onPress={() => {
            add({
              productId: product.id,
              title: product.title,
              thumbnail: product.thumbnail,
              priceInr: salePrice,
              stock: product.stock,
              quantity: qty,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
        />
        <Button
          label="Go to cart"
          variant="secondary"
          onPress={() => {
            navigation.navigate('CartTab');
          }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    paddingBottom: space.xxl,
  },
  heroWrap: {
    position: 'relative',
  },
  hero: {
    width,
    height: width * 0.85,
    backgroundColor: colors.line,
  },
  dots: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dotsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(28, 25, 23, 0.4)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 18,
    backgroundColor: '#fff',
  },
  body: {
    padding: space.lg,
    gap: space.sm,
  },
  brand: {
    fontSize: type.xs,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
  },
  meta: {
    flexDirection: 'row',
    gap: space.md,
  },
  rating: {
    color: colors.star,
    fontWeight: '700',
  },
  stock: {
    color: colors.inkMuted,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  price: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
  },
  mrp: {
    fontSize: type.md,
    color: colors.inkSubtle,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: type.md,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  qty: {
    marginTop: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyLabel: {
    fontSize: type.md,
    fontWeight: '700',
    color: colors.ink,
  },
  footer: {
    padding: space.lg,
    gap: space.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
});

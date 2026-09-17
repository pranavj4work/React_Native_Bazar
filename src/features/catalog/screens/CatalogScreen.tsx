import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeStackParamList } from '../../../core/navigation/types';
import type { DummyProduct } from '../../../shared/api/types';
import { useDebouncedValue } from '../../../shared/hooks/useDebouncedValue';
import { colors, space, type } from '../../../shared/theme/tokens';
import { EmptyState, ErrorState } from '../../../shared/ui/EmptyState';
import { CatalogSkeleton } from '../components/CatalogSkeleton';
import { CategoryChips } from '../components/CategoryChips';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { useCategories, useProductFeed } from '../hooks';

const GAP = space.md;
const H_PAD = space.lg;

export function CatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PAD * 2 - GAP) / 2;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  const filters = useMemo(
    () => ({ q: debouncedQuery, category: debouncedQuery ? '' : category }),
    [debouncedQuery, category],
  );

  const feed = useProductFeed(filters);
  const categories = useCategories();

  const products = useMemo(
    () => feed.data?.pages.flatMap((page) => page.products) ?? [],
    [feed.data],
  );

  const onPressProduct = useCallback(
    (productId: number) => {
      navigation.navigate('Product', { productId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: DummyProduct }) => (
      <ProductCard product={item} width={cardWidth} onPress={onPressProduct} />
    ),
    [cardWidth, onPressProduct],
  );

  const header = (
    <View>
      <View style={styles.heading}>
        <Text style={styles.kicker}>Bazaar</Text>
        <Text style={styles.title}>Find something good</Text>
      </View>
      <SearchBar value={query} onChangeText={setQuery} />
      {categories.data ? (
        <CategoryChips
          categories={categories.data}
          selected={debouncedQuery ? '' : category}
          onSelect={setCategory}
        />
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {header}
      {feed.isPending ? (
        <CatalogSkeleton cardWidth={cardWidth} />
      ) : feed.isError ? (
        <ErrorState
          message={feed.error instanceof Error ? feed.error.message : undefined}
          onRetry={() => void feed.refetch()}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.columns}
          contentContainerStyle={styles.list}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <EmptyState title="No products" body="Try another search or category." />
          }
          ListFooterComponent={
            feed.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} color={colors.accent} />
            ) : null
          }
          onEndReached={() => {
            if (feed.hasNextPage && !feed.isFetchingNextPage) {
              void feed.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          windowSize={7}
          maxToRenderPerBatch={8}
          initialNumToRender={6}
          removeClippedSubviews
          refreshControl={
            <RefreshControl
              refreshing={feed.isRefetching && !feed.isFetchingNextPage}
              onRefresh={() => void feed.refetch()}
              tintColor={colors.accent}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  heading: {
    paddingHorizontal: space.lg,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  kicker: {
    fontSize: type.xs,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  list: {
    backgroundColor: colors.bg,
    paddingBottom: space.xxxl,
    flexGrow: 1,
  },
  columns: {
    paddingHorizontal: H_PAD,
    gap: GAP,
    marginBottom: GAP,
  },
  footer: {
    paddingVertical: space.lg,
  },
});

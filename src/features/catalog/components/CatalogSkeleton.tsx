import { StyleSheet, View } from 'react-native';

import { space } from '../../../shared/theme/tokens';
import { Skeleton } from '../../../shared/ui/Skeleton';

export function CatalogSkeleton({ cardWidth }: { cardWidth: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={index} style={{ width: cardWidth, gap: 8 }}>
          <Skeleton height={cardWidth} />
          <Skeleton height={14} />
          <Skeleton height={14} width="60%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: space.lg,
    gap: space.md,
  },
});

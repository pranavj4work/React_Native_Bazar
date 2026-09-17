import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { DummyCategory } from '../../../shared/api/types';
import { colors, radius, space, type } from '../../../shared/theme/tokens';

type Props = {
  categories: DummyCategory[];
  selected: string;
  onSelect: (slug: string) => void;
};

export function CategoryChips({ categories, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <Chip label="All" active={selected === ''} onPress={() => onSelect('')} />
      {categories.slice(0, 16).map((category) => (
        <Chip
          key={category.slug}
          label={category.name}
          active={selected === category.slug}
          onPress={() => onSelect(category.slug)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.label, active ? styles.labelActive : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: space.lg,
    gap: space.sm,
    paddingBottom: space.sm,
  },
  chip: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  label: {
    fontSize: type.sm,
    color: colors.ink,
    fontWeight: '600',
  },
  labelActive: {
    color: '#fff',
  },
});

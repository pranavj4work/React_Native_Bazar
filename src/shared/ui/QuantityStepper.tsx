import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, space, type } from '../theme/tokens';

type Props = {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
};

export function QuantityStepper({ value, min = 1, max, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={[styles.btn, value <= min ? styles.disabled : null]}
      >
        <Text style={styles.glyph}>−</Text>
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={[styles.btn, value >= max ? styles.disabled : null]}
      >
        <Text style={styles.glyph}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.4,
  },
  glyph: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: '600',
  },
  value: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: type.md,
    fontWeight: '700',
    color: colors.ink,
  },
});

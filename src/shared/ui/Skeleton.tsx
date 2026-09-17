import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

type Props = {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
};

export function Skeleton({ width = '100%', height, borderRadius = radius.md, style }: Props) {
  return <View style={[styles.block, { width, height, borderRadius }, style]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.line,
  },
});

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, type } from '../../../shared/theme/tokens';

export function SplashScreen() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>Bazaar</Text>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
  },
});

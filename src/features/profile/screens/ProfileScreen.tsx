import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { AddressMap } from '../../../shared/ui/AddressMap';
import { useSessionStore } from '../../auth/sessionStore';
import { useAddressStore } from '../addressStore';

export function ProfileScreen() {
  const user = useSessionStore((state) => state.user);
  const logout = useSessionStore((state) => state.logout);
  const address = useAddressStore((state) => state.address);

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatarRing}>
          <Image source={{ uri: user.image }} style={styles.avatar} contentFit="cover" />
        </View>
        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <View style={styles.usernameChip}>
          <Text style={styles.username}>@{user.username}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Row icon="mail-outline" label="Email" value={user.email} />
      </View>

      <Text style={styles.section}>Saved address</Text>
      <View style={styles.card}>
        {address ? (
          <View style={styles.addressBlock}>
            <View style={styles.addressHead}>
              <View style={styles.pin}>
                <Ionicons name="location-outline" size={18} color={colors.accent} />
              </View>
              <Text style={styles.addressName}>{address.fullName}</Text>
            </View>
            <AddressMap
              line1={address.line1}
              city={address.city}
              pincode={address.pincode}
              latitude={address.latitude}
              longitude={address.longitude}
            />
            <View style={styles.credList}>
              <Row label="Street" value={address.line1 ?? ''} />
              <View style={styles.divider} />
              <Row label="City" value={`${address.city ?? ''} ${address.pincode ?? ''}`.trim()} />
              <View style={styles.divider} />
              <Row label="Phone" value={address.phone ?? ''} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyAddress}>
            <View style={styles.pin}>
              <Ionicons name="location-outline" size={18} color={colors.inkMuted} />
            </View>
            <Text style={styles.emptyTitle}>No address yet</Text>
            <Text style={styles.meta}>It saves after your first checkout.</Text>
          </View>
        )}
      </View>

      <View style={styles.noteCard}>
        <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
        <Text style={styles.note}>
          Session uses DummyJSON JWT in AsyncStorage. A 401 on an authenticated request signs you
          out.
        </Text>
      </View>

      <Button
        label="Log out"
        variant="danger"
        onPress={() => {
          Alert.alert('Log out?', 'You can sign back in with the demo user.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log out', style: 'destructive', onPress: () => void logout() },
          ]);
        }}
      />
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      {icon ? (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={16} color={colors.accent} />
        </View>
      ) : null}
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: space.lg,
    gap: space.md,
    backgroundColor: colors.bg,
    paddingBottom: space.xxxl,
  },
  hero: {
    alignItems: 'center',
    paddingTop: space.sm,
    paddingBottom: space.md,
    gap: space.sm,
  },
  avatarRing: {
    padding: 4,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.line,
  },
  name: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.4,
  },
  usernameChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: space.md,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  username: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: type.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  section: {
    marginTop: space.sm,
    fontSize: type.lg,
    fontWeight: '800',
    color: colors.ink,
  },
  addressBlock: {
    gap: space.md,
  },
  addressHead: {
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
  addressName: {
    flex: 1,
    fontSize: type.lg,
    fontWeight: '800',
    color: colors.ink,
  },
  credList: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginHorizontal: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: type.sm,
    color: colors.inkMuted,
    fontWeight: '600',
    width: 64,
  },
  rowValue: {
    flex: 1,
    fontSize: type.md,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'right',
  },
  emptyAddress: {
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
  },
  emptyTitle: {
    fontSize: type.md,
    fontWeight: '800',
    color: colors.ink,
  },
  meta: {
    color: colors.inkMuted,
    textAlign: 'center',
    fontSize: type.sm,
    lineHeight: 20,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  note: {
    flex: 1,
    fontSize: type.sm,
    color: colors.inkMuted,
    lineHeight: 20,
  },
});

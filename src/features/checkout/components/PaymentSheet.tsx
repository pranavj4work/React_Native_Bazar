import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatInr } from '../../../shared/formatters/currency';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { PAYMENT_LABEL, type PaymentMethod } from '../schema';

type Props = {
  visible: boolean;
  amount: number;
  method: PaymentMethod;
  loading: boolean;
  onClose: () => void;
  onPay: () => void;
};

export function PaymentSheet({ visible, amount, method, loading, onClose, onPay }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.kicker}>Mock payment</Text>
          <Text style={styles.title}>{PAYMENT_LABEL[method]}</Text>
          <Text style={styles.body}>
            No real charge. This sheet is here so checkout feels like an Indian store (UPI / card),
            without wiring Razorpay in two weeks.
          </Text>
          <Button
            label={loading ? 'Paying…' : `Pay ${formatInr(amount)}`}
            loading={loading}
            onPress={onPay}
          />
          <Button label="Cancel" variant="ghost" onPress={onClose} disabled={loading} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: space.xxl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    gap: space.md,
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
  },
  body: {
    fontSize: type.md,
    color: colors.inkMuted,
    lineHeight: 22,
  },
});

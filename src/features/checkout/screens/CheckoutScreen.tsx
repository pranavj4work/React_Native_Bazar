import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import type { CartStackParamList } from '../../../core/navigation/types';
import { formatInr } from '../../../shared/formatters/currency';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { TextField } from '../../../shared/ui/TextField';
import { useCartStore, useCartSubtotal } from '../../cart/cartStore';
import { useOrderStore } from '../../orders/orderStore';
import { useSessionStore } from '../../auth/sessionStore';
import { useAddressStore } from '../../profile/addressStore';
import { PaymentSheet } from '../components/PaymentSheet';
import { LocationPicker } from '../components/LocationPicker';
import {
  checkoutSchema,
  PAYMENT_LABEL,
  type CheckoutForm,
  type PaymentMethod,
} from '../schema';
import type { GeoPoint } from '../../../shared/maps/geocode';

const METHODS: PaymentMethod[] = ['cod', 'upi', 'card'];

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<CartStackParamList>>();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);
  const subtotal = useCartSubtotal();
  const user = useSessionStore((state) => state.user);
  const savedAddress = useAddressStore((state) => state.address);
  const saveAddress = useAddressStore((state) => state.save);
  const placeOrder = useOrderStore((state) => state.placeOrder);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pin, setPin] = useState<GeoPoint | null>(
    savedAddress?.latitude != null && savedAddress?.longitude != null
      ? { latitude: savedAddress.latitude, longitude: savedAddress.longitude }
      : null,
  );
  const [mapError, setMapError] = useState<string | null>(null);

  const { control, handleSubmit, watch } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: savedAddress?.fullName ?? user?.firstName ?? '',
      phone: savedAddress?.phone ?? '',
      pincode: savedAddress?.pincode ?? '',
      city: savedAddress?.city ?? '',
      line1: savedAddress?.line1 ?? '',
      paymentMethod: 'cod',
    },
  });

  const method = watch('paymentMethod');

  const completeOrder = (values: CheckoutForm) => {
    if (!user || items.length === 0) return;
    if (!pin) {
      setMapError('Drop a pin on the map');
      return;
    }
    const { paymentMethod, ...rest } = values;
    const address = { ...rest, ...pin };
    saveAddress(address);
    const order = placeOrder({
      userId: user.id,
      items,
      address,
      paymentMethod,
    });
    clearCart();
    navigation.replace('OrderSuccess', { orderId: order.id });
  };

  const onContinue = handleSubmit((values) => {
    if (!pin) {
      setMapError('Drop a pin on the map');
      return;
    }
    if (values.paymentMethod === 'cod') {
      completeOrder(values);
      return;
    }
    setSheetOpen(true);
  });

  const onPay = handleSubmit(async (values) => {
    setPaying(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setPaying(false);
    setSheetOpen(false);
    completeOrder(values);
  });

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Delivery address</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field, fieldState }) => (
            <TextField
              label="Full name"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              label="Mobile"
              keyboardType="phone-pad"
              maxLength={10}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="pincode"
          render={({ field, fieldState }) => (
            <TextField
              label="Pincode"
              keyboardType="number-pad"
              maxLength={6}
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => (
            <TextField
              label="City"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="line1"
          render={({ field, fieldState }) => (
            <TextField
              label="House / street"
              value={field.value}
              onChangeText={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <LocationPicker
          value={pin}
          city={watch('city')}
          pincode={watch('pincode')}
          error={mapError ?? undefined}
          onChange={(point) => {
            setPin(point);
            setMapError(null);
          }}
        />

        <Text style={styles.section}>Payment</Text>
        <Controller
          control={control}
          name="paymentMethod"
          render={({ field }) => (
            <View style={styles.methods}>
              {METHODS.map((option) => {
                const active = field.value === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => field.onChange(option)}
                    style={[styles.method, active ? styles.methodActive : null]}
                  >
                    <Text style={[styles.methodLabel, active ? styles.methodLabelActive : null]}>
                      {PAYMENT_LABEL[option]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Payable</Text>
          <Text style={styles.summaryValue}>{formatInr(subtotal)}</Text>
        </View>
        <Button
          label={method === 'cod' ? 'Place order' : 'Continue to pay'}
          onPress={onContinue}
          disabled={items.length === 0}
        />
      </ScrollView>
      <PaymentSheet
        visible={sheetOpen}
        amount={subtotal}
        method={method}
        loading={paying}
        onClose={() => setSheetOpen(false)}
        onPay={onPay}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: space.lg,
    gap: space.md,
    paddingBottom: space.xxxl,
  },
  section: {
    marginTop: space.sm,
    fontSize: type.lg,
    fontWeight: '800',
    color: colors.ink,
  },
  methods: {
    gap: space.sm,
  },
  method: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: space.md,
  },
  methodActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  methodLabel: {
    fontSize: type.md,
    color: colors.ink,
    fontWeight: '600',
  },
  methodLabelActive: {
    color: colors.accent,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.md,
  },
  summaryLabel: {
    fontSize: type.md,
    color: colors.inkMuted,
  },
  summaryValue: {
    fontSize: type.xl,
    fontWeight: '800',
    color: colors.ink,
  },
});

import { z } from 'zod';

import type { CartItem } from '../cart/cartLogic';

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile'),
  pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode'),
  city: z.string().min(2, 'Enter your city'),
  line1: z.string().min(5, 'Enter house / street'),
  paymentMethod: z.enum(['cod', 'upi', 'card']),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
export type PaymentMethod = CheckoutForm['paymentMethod'];

export type Address = Omit<CheckoutForm, 'paymentMethod'> & {
  latitude?: number;
  longitude?: number;
};

export type OrderStatus = 'placed' | 'packing' | 'shipped';

export type Order = {
  id: string;
  userId: number;
  items: CartItem[];
  address: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  createdAt: string;
};

export function createOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export function deriveOrderStatus(createdAt: string, now = Date.now()): OrderStatus {
  const ageMs = now - new Date(createdAt).getTime();
  if (ageMs > 10 * 60 * 1000) return 'shipped';
  if (ageMs > 2 * 60 * 1000) return 'packing';
  return 'placed';
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cod: 'Cash on delivery',
  upi: 'UPI',
  card: 'Credit / debit card',
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  packing: 'Packing',
  shipped: 'Shipped',
};

import { deriveOrderStatus } from '../../features/checkout/schema';
import { discountedUsd, formatInr, usdToInr } from './currency';

describe('currency', () => {
  it('converts USD to whole rupees', () => {
    expect(usdToInr(10)).toBe(830);
  });

  it('applies discount before conversion', () => {
    expect(discountedUsd(100, 10)).toBe(90);
  });

  it('formats INR with the India locale', () => {
    expect(formatInr(1299)).toBe('₹1,299');
  });
});

describe('deriveOrderStatus', () => {
  const now = Date.parse('2026-09-11T12:00:00.000Z');

  it('is placed, packing, then shipped as the order ages', () => {
    expect(deriveOrderStatus('2026-09-11T11:59:00.000Z', now)).toBe('placed');
    expect(deriveOrderStatus('2026-09-11T11:50:00.000Z', now)).toBe('packing');
    expect(deriveOrderStatus('2026-09-11T11:00:00.000Z', now)).toBe('shipped');
  });
});

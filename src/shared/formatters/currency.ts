export const USD_TO_INR = 83;

export function usdToInr(usd: number): number {
  return Math.round(usd * USD_TO_INR);
}

export function discountedUsd(price: number, discountPercentage: number): number {
  return price * (1 - discountPercentage / 100);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

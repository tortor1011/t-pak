/**
 * Format number as Thai Baht currency
 */
export function formatCurrency(amount: number): string {
  return `฿ ${amount.toLocaleString('en-US')}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

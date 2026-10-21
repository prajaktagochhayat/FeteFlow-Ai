/**
 * Utility to format currencies with full support for Indian Rupee (INR) numbering system:
 * e.g., ₹15,00,000 instead of 1,500,000
 */

export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  options?: { compact?: boolean; hideSymbol?: boolean }
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';

  const isINR = currency.toUpperCase() === 'INR' || currency === '₹';
  const symbol = options?.hideSymbol
    ? ''
    : isINR
    ? '₹'
    : currency === 'USD'
    ? '$'
    : currency === 'EUR'
    ? '€'
    : currency === 'GBP'
    ? '£'
    : `${currency} `;

  // Compact Indian notation for large numbers (Lakhs & Crores)
  if (options?.compact && isINR) {
    if (Math.abs(amount) >= 10000000) {
      const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
      return `${symbol}${cr} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      const lakh = (amount / 100000).toFixed(2).replace(/\.00$/, '');
      return `${symbol}${lakh} Lakh`;
    }
  }

  // Use Indian English locale ('en-IN') for proper 2-digit grouping (12,34,567)
  const locale = isINR ? 'en-IN' : 'en-US';
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString(locale);

  return `${symbol}${formatted}`;
}

export function formatNumberIndian(amount: number): string {
  return Math.round(amount).toLocaleString('en-IN');
}

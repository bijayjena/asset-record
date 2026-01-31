export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'KRW';

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
  { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
  { value: 'KRW', label: 'South Korean Won', symbol: '₩' },
];

export const getCurrencySymbol = (currency: Currency): string => {
  const found = CURRENCIES.find(c => c.value === currency);
  return found?.symbol || '$';
};

export const formatPrice = (amount: number | null, currency: Currency = 'USD'): string => {
  if (amount === null || amount === undefined) return '';
  
  const symbol = getCurrencySymbol(currency);
  
  // Format based on currency conventions
  if (currency === 'JPY' || currency === 'KRW') {
    // No decimals for Yen and Won
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

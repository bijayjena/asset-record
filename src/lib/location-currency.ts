import type { Currency } from './currency';

// Map of country codes to currencies
const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  US: 'USD',
  GB: 'GBP',
  EU: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  IN: 'INR',
  JP: 'JPY',
  AU: 'AUD',
  CA: 'CAD',
  CH: 'CHF',
  CN: 'CNY',
  KR: 'KRW',
};

export const detectCurrencyFromLocation = async (): Promise<Currency> => {
  try {
    // Try to get location from IP geolocation API
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });

    if (!response.ok) {
      throw new Error('Geolocation API failed');
    }

    const data = await response.json();
    const countryCode = data.country_code as string;

    // Return currency based on country code, fallback to INR
    return COUNTRY_CURRENCY_MAP[countryCode] || 'INR';
  } catch (error) {
    console.log('Location detection failed, defaulting to INR:', error);
    return 'INR';
  }
};

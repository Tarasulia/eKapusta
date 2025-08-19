export type Currency = 'USD' | 'EUR' | 'UAH' | 'PLN' | 'GBP'

export interface CurrencyInfo {
  value: Currency
  label: string
  symbol: string
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  UAH: '₴',
  PLN: 'zł',
  GBP: '£'
} as const

export const CURRENCIES: CurrencyInfo[] = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'UAH', label: 'UAH (₴)', symbol: '₴' },
  { value: 'PLN', label: 'PLN (zł)', symbol: 'zł' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
] as const

export const DEFAULT_CURRENCY: Currency = 'USD'

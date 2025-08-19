import { CURRENCY_SYMBOLS, Currency } from '../constants/currencies.js'
import { TransactionType } from '../types/savings.js'

/**
 * Форматує суму з символом валюти
 */
export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol}${Math.abs(amount).toLocaleString()}`
}

/**
 * Форматує суму з урахуванням типу транзакції
 */
export const formatCurrencyWithType = (
  amount: number,
  currency: Currency,
  type?: TransactionType
): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formattedAmount = `${symbol} ${amount.toFixed(2)}`
  return type === 'withdrawal' ? `-${formattedAmount}` : `+${formattedAmount}`
}

/**
 * Форматує дату
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Форматує місяць і рік
 */
export const formatMonth = (monthStr: string): string => {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' })
}

/**
 * Розраховує відсоток
 */
export const calculatePercentage = (value: number, total: number): string => {
  return total > 0 ? ((value / total) * 100).toFixed(1) : '0'
}

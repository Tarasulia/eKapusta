import { Saving } from './savings.js'

// Базові пропси для модальних вікон
export interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
}

// Пропси для модалу редагування
export interface EditModalProps extends BaseModalProps {
  saving: Saving
}

// Запис балансу для таблиці транзакцій
export interface BalanceEntry {
  date: string
  usdBalance: number
  eurBalance: number
  comment: string
  transactions: Saving[]
}

// Дані для графіків
export interface ChartData {
  name: string
  value: number
  percentage: string
}

export interface MonthlyChartData {
  month: string
  amount: number
  count: number
}

// Фільтри
export type SortOrder = 'asc' | 'desc'
export type CurrencyFilter = 'all' | 'USD' | 'EUR'
export type TransactionFilter = 'all' | 'deposit' | 'withdrawal'
export type DebtFilter = 'all' | 'active' | 'repaid'

// Групування боргів
export interface DebtGroup {
  person: string
  totalOwed: number  // сума що вам винні (ви позичили)
  totalBorrowed: number // сума що ви винні (взяли у когось)
  netAmount: number  // чистий баланс
  transactions: Saving[]
}

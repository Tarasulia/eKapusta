import { TransactionType } from '../types/savings.js'

export interface TransactionTypeInfo {
  value: TransactionType
  label: string
  icon: string
  color: {
    bg: string
    text: string
    icon: string
  }
}

export const TRANSACTION_TYPES: TransactionTypeInfo[] = [
  {
    value: 'deposit',
    label: 'Поповнення (+)',
    icon: '💰',
    color: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600'
    }
  },
  {
    value: 'withdrawal',
    label: 'Зняття (-)',
    icon: '💸',
    color: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: 'text-red-600'
    }
  },
] as const

export const DEFAULT_TRANSACTION_TYPE: TransactionType = 'deposit'

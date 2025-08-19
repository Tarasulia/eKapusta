import { Currency } from '../constants/currencies.js'

export type TransactionType = 'deposit' | 'withdrawal';

export interface Saving {
  id?: number;
  amount: number;
  date: string; // YYYY-MM-DD format
  comment: string;
  currency: Currency;
  createdAt: string;
  type: TransactionType; // 'deposit' for adding money, 'withdrawal' for taking money out
  isDebt?: boolean; // чи це борг
  debtTo?: string; // кому винен або хто винен (ім'я)
  isRepaid?: boolean; // чи повернений борг
}

export interface MonthlySavings {
  month: string; // YYYY-MM format
  total: number;
  count: number;
  savings: Saving[];
}

export interface SavingsStats {
  totalAmount: number;
  totalCount: number;
  averagePerMonth: number;
  currencies: { [currency: string]: number };
  monthlyData: MonthlySavings[];
}

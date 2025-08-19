import Dexie, { Table } from 'dexie';
import { Saving } from '../types/savings.js';

export class SavingsDatabase extends Dexie {
  savings!: Table<Saving>;

  constructor() {
    super('SavingsDatabase');
    this.version(1).stores({
      savings: '++id, amount, date, comment, currency, createdAt'
    });

    // Add the type field to the schema in version 2
    this.version(2).stores({
      savings: '++id, amount, date, comment, currency, createdAt, type'
    }).upgrade(tx => {
      // Add default type 'deposit' to existing records
      return tx.table('savings').toCollection().modify(saving => {
        saving.type = 'deposit';
      });
    });

    // Add debt fields in version 3
    this.version(3).stores({
      savings: '++id, amount, date, comment, currency, createdAt, type, isDebt, debtTo, isRepaid'
    }).upgrade(tx => {
      // Add default debt values to existing records
      return tx.table('savings').toCollection().modify(saving => {
        saving.isDebt = false;
        saving.isRepaid = false;
      });
    });
  }
}

export const db = new SavingsDatabase();

// Database operations
export const savingsOperations = {
  // Add new saving
  addSaving: async (saving: Omit<Saving, 'id'>): Promise<number> => {
    return await db.savings.add(saving);
  },

  // Get all savings
  getAllSavings: async (): Promise<Saving[]> => {
    return await db.savings.orderBy('date').reverse().toArray();
  },

  // Get savings by date range
  getSavingsByDateRange: async (startDate: string, endDate: string): Promise<Saving[]> => {
    return await db.savings
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  // Update saving
  updateSaving: async (id: number, saving: Partial<Saving>): Promise<number> => {
    return await db.savings.update(id, saving);
  },

  // Delete saving
  deleteSaving: async (id: number): Promise<void> => {
    await db.savings.delete(id);
  },

  // Get savings by currency
  getSavingsByCurrency: async (currency: string): Promise<Saving[]> => {
    return await db.savings.where('currency').equals(currency).toArray();
  },

  // Get total by currency
  getTotalByCurrency: async (currency: string): Promise<number> => {
    const savings = await db.savings.where('currency').equals(currency).toArray();
    return savings.reduce((total, saving) => {
      const amount = saving.type === 'withdrawal' ? -saving.amount : saving.amount;
      return total + amount;
    }, 0);
  },

  // Get monthly statistics
  getMonthlyStats: async (): Promise<{ [key: string]: { total: number; count: number; savings: Saving[] } }> => {
    const savings = await db.savings.toArray();
    const monthlyStats: { [key: string]: { total: number; count: number; savings: Saving[] } } = {};

    savings.forEach(saving => {
      const monthKey = saving.date.substring(0, 7); // YYYY-MM format
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total: 0, count: 0, savings: [] };
      }
      const amount = saving.type === 'withdrawal' ? -saving.amount : saving.amount;
      monthlyStats[monthKey].total += amount;
      monthlyStats[monthKey].count += 1;
      monthlyStats[monthKey].savings.push(saving);
    });

    return monthlyStats;
  },

  // Get savings statistics
  getStats: async () => {
    const savings = await db.savings.toArray();
    const monthlyStats = await savingsOperations.getMonthlyStats();

    const totalAmount = savings.reduce((sum, saving) => {
      const amount = saving.type === 'withdrawal' ? -saving.amount : saving.amount;
      return sum + amount;
    }, 0);
    const currencies = savings.reduce((acc, saving) => {
      const amount = saving.type === 'withdrawal' ? -saving.amount : saving.amount;
      acc[saving.currency] = (acc[saving.currency] || 0) + amount;
      return acc;
    }, {} as { [currency: string]: number });

    const monthlyData = Object.entries(monthlyStats)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const averagePerMonth = monthlyData.length > 0 ? totalAmount / monthlyData.length : 0;

    return {
      totalAmount,
      totalCount: savings.length,
      averagePerMonth,
      currencies,
      monthlyData
    };
    }
};

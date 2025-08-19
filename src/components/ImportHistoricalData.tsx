import { useState } from 'react'
import { savingsOperations } from '../lib/database.js'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '../hooks/useSavings.js'
import { TransactionType } from '../types/savings.js'
import { Currency } from '../constants/currencies.js'

export default function ImportHistoricalData() {
  const [isImporting, setIsImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const queryClient = useQueryClient()

  const handleImport = async () => {
    if (imported) return

    if (!window.confirm('Імпортувати всі ваші історичні дані з 2022-2025? Це додасть близько 100 транзакцій.')) {
      return
    }

    setIsImporting(true)

    try {
      // Історія балансів
      const balanceHistory = [
        {balance: 6500, date: '2022-10-04'},
        {balance: 9300, date: '2022-10-05'},
        {balance: 12300, date: '2022-10-10'},
        {balance: 15400, date: '2022-12-25'},
        {balance: 14050, date: '2023-01-07'},
        {balance: 15300, date: '2023-01-13'},
        {balance: 18300, date: '2023-01-16'},
        {balance: 18700, date: '2023-02-03'},
        {balance: 21300, date: '2023-02-11'},
        {balance: 22200, date: '2023-02-18'},
        {balance: 22150, date: '2023-02-24'},
        {balance: 22650, date: '2023-02-26'},
        {balance: 23200, date: '2023-03-01'},
        {balance: 25000, date: '2023-03-12'},
        {balance: 25700, date: '2023-03-15'},
        {balance: 26300, date: '2023-04-05'},
        {balance: 26200, date: '2023-04-09'},
        {balance: 28800, date: '2023-04-10'},
        {balance: 29800, date: '2023-04-12'},
        {balance: 29300, date: '2023-04-20'},
        {balance: 30100, date: '2023-04-23'},
        {balance: 29000, date: '2023-05-02'},
        {balance: 30600, date: '2023-05-07'},
        {balance: 32500, date: '2023-05-14'},
        {balance: 32350, date: '2023-05-19'},
        {balance: 33750, date: '2023-05-24'},
        {balance: 35350, date: '2023-06-02'},
        {balance: 37850, date: '2023-06-11'},
        {balance: 39650, date: '2023-06-18'},
        {balance: 49650, date: '2023-06-25'},
        {balance: 15650, date: '2023-06-28'},
        {balance: 15000, date: '2023-06-30'},
        {balance: 16000, date: '2023-07-05'},
        {balance: 15700, date: '2023-07-08'},
        {balance: 18200, date: '2023-07-08'},
        {balance: 11700, date: '2023-07-09'},
        {balance: 10700, date: '2023-07-13'},
        {balance: 9000, date: '2023-07-17'},
        {balance: 9400, date: '2023-07-19'},
        {balance: 10400, date: '2023-07-22'},
        {balance: 10000, date: '2023-07-25'},
        {balance: 11300, date: '2023-07-27'},
        {balance: 11000, date: '2023-07-30'},
        {balance: 10700, date: '2023-08-02'},
        {balance: 13700, date: '2023-08-09'},
        {balance: 13400, date: '2023-08-12'},
        {balance: 13000, date: '2023-08-21'},
        {balance: 14000, date: '2023-08-29'},
        {balance: 13000, date: '2023-09-04'},
        {balance: 17000, date: '2023-09-10'},
        {balance: 15800, date: '2023-09-18'},
        {balance: 16330, date: '2023-09-23'},
        {balance: 17730, date: '2023-09-28'},
        {balance: 20730, date: '2023-10-08'},
        {balance: 21930, date: '2023-10-08'},
        {balance: 21830, date: '2023-10-15'},
        {balance: 20730, date: '2023-11-03'},
        {balance: 20530, date: '2023-11-04'},
        {balance: 24530, date: '2023-11-09'},
        {balance: 23300, date: '2023-11-24'},
        {balance: 24500, date: '2023-11-26'},
        {balance: 24300, date: '2023-12-03'},
        {balance: 25100, date: '2023-12-05'},
        {balance: 27000, date: '2023-12-09'},
        {balance: 27200, date: '2023-12-11'},
        {balance: 26600, date: '2023-12-17', comment: 'Мамі 400$ позичив, 200 поміняв'},
        {balance: 26300, date: '2023-12-22'},
        {balance: 25800, date: '2024-01-08'},
        {balance: 26450, date: '2024-01-08'},
        {balance: 26950, date: '2024-01-09'},
        {balance: 27050, date: '2024-01-11'},
        {balance: 28150, date: '2024-01-23'},
        {balance: 27800, date: '2024-02-08'},
        {balance: 28250, date: '2024-02-10'},
        {balance: 28750, date: '2024-02-11'},
        {balance: 30750, date: '2024-02-11'},
        {balance: 29400, date: '2024-02-15'},
        {balance: 29200, date: '2024-02-17'},
        {balance: 29600, date: '2024-02-24'},
        {balance: 29200, date: '2024-03-06'},
        {balance: 29400, date: '2024-03-10'},
        {balance: 30500, date: '2024-03-13'},
        {balance: 31400, date: '2024-03-18'},
        {balance: 30800, date: '2024-04-07'},
        {balance: 32800, date: '2024-04-08'},
        {balance: 32300, date: '2024-04-29'},
        {balance: 32100, date: '2024-05-07', comment: 'купили айпад татові'},
        {balance: 32600, date: '2025-05-08'},
        {balance: 35600, date: '2025-05-09'},
        {balance: 35400, date: '2025-05-18', comment: 'взяв 200 на ремонт корси'},
        {usd: 35750, eur: 1600, date: '2025-06-09', comment: 'Взяв 200 на квартиру'},
        {usd: 36750, eur: 1600, date: '2025-06-09'},
        {usd: 37000, eur: 1600, date: '2025-06-10'},
        {usd: 36550, eur: 1600, date: '2025-06-16'},
        {usd: 36400, eur: 1600, date: '2025-07-02'},
        {usd: 30400, eur: 1600, date: '2025-07-03', comment: 'позичив Вові 6к до кінця серпня'},
        {usd: 30000, eur: 1600, date: '2025-07-04', comment: 'взяв 500 Максиму на весілля'},
        {usd: 31200, eur: 1100, date: '2025-07-09', comment: 'купив 1.2, взяв 500євро на фари'},
        {usd: 33200, eur: 1100, date: '2025-07-12'},
        {usd: 34450, eur: 1100, date: '2025-07-17'},
        {usd: 34150, eur: 600, date: '2025-07-28'},
        {usd: 37550, eur: 0, date: '2025-08-12'},
        {usd: 37850, eur: 0, date: '2025-08-13'}
      ]

      const transactions = []

      // Початковий баланс
      transactions.push({
        amount: 6500,
        date: '2022-10-04',
        currency: 'USD' as Currency,
        type: 'deposit' as TransactionType,
        comment: 'Початковий баланс',
        createdAt: new Date().toISOString()
      })

      // Розраховуємо зміни
      for (let i = 1; i < balanceHistory.length; i++) {
        const prev = balanceHistory[i - 1]
        const curr = balanceHistory[i]

        const prevUsd = typeof prev.balance === 'number' ? prev.balance : (prev.usd || 0)
        const prevEur = typeof prev.balance === 'number' ? 0 : (prev.eur || 0)

        const currUsd = typeof curr.balance === 'number' ? curr.balance : (curr.usd || 0)
        const currEur = typeof curr.balance === 'number' ? 0 : (curr.eur || 0)

        const usdChange = currUsd - prevUsd
        const eurChange = currEur - prevEur

        if (usdChange !== 0) {
          transactions.push({
            amount: Math.abs(usdChange),
            date: curr.date,
            currency: 'USD' as Currency,
            type: (usdChange > 0 ? 'deposit' : 'withdrawal') as TransactionType,
            comment: curr.comment || `Зміна балансу: ${usdChange > 0 ? '+' : ''}${usdChange}`,
            createdAt: new Date().toISOString()
          })
        }

        if (eurChange !== 0) {
          transactions.push({
            amount: Math.abs(eurChange),
            date: curr.date,
            currency: 'EUR' as Currency,
            type: (eurChange > 0 ? 'deposit' : 'withdrawal') as TransactionType,
            comment: curr.comment || `Зміна EUR балансу: ${eurChange > 0 ? '+' : ''}${eurChange}`,
            createdAt: new Date().toISOString()
          })
        }
      }

      // Додаємо в базу
      let count = 0
      for (const transaction of transactions) {
        await savingsOperations.addSaving(transaction)
        count++
      }

      setImported(true)

      // Оновлюємо дані
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.savings })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats })

      alert(`✅ Успішно імпортовано ${count} транзакцій!`)

    } catch (error) {
      console.error('Import failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Невідома помилка'
      alert(`Помилка при імпорті даних: ${errorMessage}`)
    } finally {
      setIsImporting(false)
    }
  }

  if (imported) {
    return (
      <button
        disabled
        style={{
          padding: '8px 16px',
          backgroundColor: '#e5e7eb',
          color: '#6b7280',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'not-allowed'
        }}
      >
        ✅ Історичні дані імпортовано
      </button>
    )
  }

  return (
    <button
      onClick={handleImport}
      disabled={isImporting}
      style={{
        padding: '8px 16px',
        backgroundColor: isImporting ? '#9ca3af' : '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: isImporting ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }}
    >
      {isImporting ? 'Імпортую...' : '📁 Імпортувати історичні дані'}
    </button>
  )
}

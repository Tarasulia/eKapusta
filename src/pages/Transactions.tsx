import { useState } from 'react'
import { FunnelIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useSavings, useDeleteSaving } from '../hooks/useSavings.js'
import { Saving } from '../types/savings.js'
import EditSavingModal from '../components/EditSavingModal.js'
import ImportHistoricalData from '../components/ImportHistoricalData.js'

interface BalanceEntry {
  date: string
  usdBalance: number
  eurBalance: number
  comment: string
  transactions: Saving[] // додаємо транзакції для цієї дати
}

export default function Transactions() {
  const { data: savings = [], isLoading, error } = useSavings()
  const deleteSaving = useDeleteSaving()
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null)
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

      // Розраховуємо баланси по датах
  const calculateBalances = (): BalanceEntry[] => {
    // Сортуємо транзакції по даті
    const sortedSavings = [...savings].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const balanceMap = new Map<string, { usdBalance: number, eurBalance: number, comments: string[], transactions: Saving[] }>()
    let runningUsdBalance = 0
    let runningEurBalance = 0

    for (const saving of sortedSavings) {
      const amount = saving.type === 'withdrawal' ? -saving.amount : saving.amount

      if (saving.currency === 'USD') {
        runningUsdBalance += amount
      } else if (saving.currency === 'EUR') {
        runningEurBalance += amount
      }

      const dateKey = saving.date
      const existing = balanceMap.get(dateKey) || {
        usdBalance: runningUsdBalance,
        eurBalance: runningEurBalance,
        comments: [],
        transactions: []
      }

      existing.usdBalance = runningUsdBalance
      existing.eurBalance = runningEurBalance
      existing.transactions.push(saving)

      if (saving.comment && !existing.comments.includes(saving.comment)) {
        existing.comments.push(saving.comment)
      }

      balanceMap.set(dateKey, existing)
    }

    // Перетворюємо в масив
    const balances: BalanceEntry[] = Array.from(balanceMap.entries()).map(([date, data]) => ({
      date,
      usdBalance: data.usdBalance,
      eurBalance: data.eurBalance,
      comment: data.comments.join('; '),
      transactions: data.transactions
    }))

    return balances.sort((a, b) => {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const balanceEntries = calculateBalances()

  // Фільтрація
  const filteredBalances = balanceEntries.filter(entry => {
    if (currencyFilter === 'USD' && entry.usdBalance === 0) return false
    if (currencyFilter === 'EUR' && entry.eurBalance === 0) return false
    return true
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatBalance = (usdBalance: number, eurBalance: number) => {
    const parts = []
    if (usdBalance > 0) {
      parts.push(`${(usdBalance / 1000).toFixed(1)}`)
    }
    if (eurBalance > 0) {
      parts.push(`${(eurBalance / 1000).toFixed(1)}`)
    }
    return parts.join('/')
  }

  // Статистика - шукаємо останній баланс по даті (не по сортуванню в UI)
  const lastEntry = balanceEntries.length > 0
    ? balanceEntries.reduce((latest, current) =>
        new Date(current.date).getTime() > new Date(latest.date).getTime() ? current : latest
      )
    : null

  const currentUsdBalance = lastEntry ? lastEntry.usdBalance : 0
  const currentEurBalance = lastEntry ? lastEntry.eurBalance : 0

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю транзакцію?')) {
      try {
        await deleteSaving.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting transaction:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">
          <h3 className="font-medium">Помилка завантаження</h3>
          <p className="mt-1 text-sm">Не вдалося завантажити дані. Спробуйте оновити сторінку.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Історія балансів</h1>
          <p className="mt-2 text-sm text-gray-700">
            Баланс рахунку по датах у вашому форматі.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16">
          <ImportHistoricalData />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Записів</dt>
                  <dd className="text-lg font-medium text-gray-900">{balanceEntries.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">$</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Поточний USD</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${currentUsdBalance.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">€</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Поточний EUR</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    €{currentEurBalance.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

                        {/* Фільтри */}
      <div className="bg-white shadow rounded-lg p-4">
        {/* Десктопний вигляд */}
        <div className="hidden sm:flex sm:items-center sm:space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Валюта:</label>
            <select
              value={currencyFilter}
              onChange={(e) => setCurrencyFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="all">Всі</option>
              <option value="USD">Тільки USD</option>
              <option value="EUR">Тільки EUR</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Сортування:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="desc">Нові спочатку</option>
              <option value="asc">Старі спочатку</option>
            </select>
          </div>
        </div>

        {/* Мобільний вигляд */}
        <div className="sm:hidden space-y-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Фільтри</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full text-sm border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">Всі валюти</option>
                <option value="USD">Тільки USD</option>
                <option value="EUR">Тільки EUR</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сортування</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full text-sm border-gray-300 rounded-md px-3 py-2"
              >
                <option value="desc">Нові записи спочатку</option>
                <option value="asc">Старі записи спочатку</option>
              </select>
            </div>
          </div>
        </div>
      </div>

            {/* Таблиця балансів */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Десктопна таблиця */}
        <div className="hidden sm:block">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Баланс
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USD (тис.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EUR (тис.)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Коментар
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBalances.map((entry) => (
                <tr key={entry.date} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatBalance(entry.usdBalance, entry.eurBalance)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(entry.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-green-600">
                      ${entry.usdBalance.toLocaleString()}
                    </span>
                    <div className="text-xs text-gray-500">
                      {(entry.usdBalance / 1000).toFixed(1)}k
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.eurBalance > 0 ? (
                      <>
                        <span className="text-sm font-medium text-purple-600">
                          €{entry.eurBalance.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-500">
                          {(entry.eurBalance / 1000).toFixed(1)}k
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={entry.comment}>
                      {entry.comment || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {entry.transactions.length === 1 ? (
                        // Якщо тільки одна транзакція - показуємо кнопки редагування/видалення
                        <>
                          <button
                            onClick={() => setEditingSaving(entry.transactions[0])}
                            className="text-blue-600 hover:text-blue-900"
                            title="Редагувати"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.transactions[0].id!)}
                            disabled={deleteSaving.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Видалити"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        // Якщо кілька транзакцій - показуємо дропдаун
                        <div className="relative inline-block text-left">
                          <details className="group">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-900 list-none">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {entry.transactions.length} оп.
                              </span>
                            </summary>
                            <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                              <div className="py-1">
                                {entry.transactions.map((transaction) => (
                                  <div key={transaction.id} className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                      <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                                        {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toLocaleString()} {transaction.currency}
                                      </span>
                                      <div className="flex space-x-1">
                                        <button
                                          onClick={() => setEditingSaving(transaction)}
                                          className="text-blue-600 hover:text-blue-900"
                                          title="Редагувати"
                                        >
                                          <PencilIcon className="h-3 w-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDelete(transaction.id!)}
                                          disabled={deleteSaving.isPending}
                                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                          title="Видалити"
                                        >
                                          <TrashIcon className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                    {transaction.comment && (
                                      <div className="text-xs text-gray-500 mt-1 truncate">
                                        {transaction.comment}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

                {/* Мобільний компактний вигляд */}
        <div className="sm:hidden">
          <div className="divide-y divide-gray-200">
            {filteredBalances.map((entry) => (
              <div key={entry.date} className="px-4 py-3">
                {/* Перший рядок: Баланс • Дата • Дії */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium text-gray-900">
                      {formatBalance(entry.usdBalance, entry.eurBalance)}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  {/* Дії */}
                  <div className="flex items-center space-x-1">
                    {entry.transactions.length === 1 ? (
                      <>
                        <button
                          onClick={() => setEditingSaving(entry.transactions[0])}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Редагувати"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.transactions[0].id!)}
                          disabled={deleteSaving.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1"
                          title="Видалити"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="relative inline-block text-left">
                        <details className="group">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-900 list-none">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {entry.transactions.length}
                            </span>
                          </summary>
                          <div className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="py-1">
                              {entry.transactions.map((transaction) => (
                                <div key={transaction.id} className="px-3 py-2 text-sm text-gray-700 border-b border-gray-100 last:border-b-0">
                                  <div className="flex items-center justify-between">
                                    <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                                      {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toLocaleString()} {transaction.currency}
                                    </span>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => setEditingSaving(transaction)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Редагувати"
                                      >
                                        <PencilIcon className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(transaction.id!)}
                                        disabled={deleteSaving.isPending}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        title="Видалити"
                                      >
                                        <TrashIcon className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                  {transaction.comment && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      {transaction.comment}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                </div>

                {/* Другий рядок: Суми */}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium text-green-600">
                    ${entry.usdBalance.toLocaleString()}
                  </span>
                  {entry.eurBalance > 0 && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-purple-600">
                        €{entry.eurBalance.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Третій рядок: Коментар (якщо є) */}
                {entry.comment && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {entry.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {filteredBalances.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              📊
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Немає записів</h3>
            <p className="mt-1 text-sm text-gray-500">
              {currencyFilter !== 'all'
                ? 'Спробуйте змінити фільтри'
                : 'Додайте свою першу транзакцію'}
            </p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingSaving && (
        <EditSavingModal
          saving={editingSaving}
          isOpen={!!editingSaving}
          onClose={() => setEditingSaving(null)}
        />
      )}
    </div>
  )
}

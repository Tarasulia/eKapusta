import { useState } from 'react'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useSavings, useDeleteSaving } from '../hooks/useSavings.js'
import { Saving } from '../types/savings.js'
import EditSavingModal from '../components/EditSavingModal.js'
import ImportHistoricalData from '../components/ImportHistoricalData.js'

export default function GeneralList() {
  const { data: savings = [], isLoading, error } = useSavings()
  const deleteSaving = useDeleteSaving()
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null)

  const handleDelete = async (id: number) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей запис?')) {
      try {
        await deleteSaving.mutateAsync(id)
      } catch (error) {
        console.error('Error deleting saving:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string, type?: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      UAH: '₴',
      PLN: 'zł',
      GBP: '£'
    }
    const symbol = symbols[currency] || currency
    const formattedAmount = `${symbol} ${amount.toFixed(2)}`
    return type === 'withdrawal' ? `-${formattedAmount}` : `+${formattedAmount}`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
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

  if (savings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          💰
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Немає записів</h3>
        <p className="mt-1 text-sm text-gray-500">
          Почніть з додавання вашої першої заощадження.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Список загальний</h1>
          <p className="mt-2 text-sm text-gray-700">
            Всі ваші заощадження в одному місці.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16">
          <ImportHistoricalData />
        </div>
      </div>

      {/* Mobile view */}
      <div className="lg:hidden space-y-4">
        {savings.map((saving) => (
          <div key={saving.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-semibold ${
                    saving.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {saving.type === 'withdrawal' ? '💸' : '💰'} {formatCurrency(saving.amount, saving.currency, saving.type)}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                    {saving.currency}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{formatDate(saving.date)}</p>
                {saving.comment && (
                  <p className="mt-1 text-sm text-gray-500">{saving.comment}</p>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => setEditingSaving(saving)}
                  className="p-1 text-gray-400 hover:text-blue-500"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(saving.id!)}
                  disabled={deleteSaving.isPending}
                  className="p-1 text-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden lg:block">
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сума
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Коментар
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Валюта
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {savings.map((saving) => (
                <tr key={saving.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {saving.type === 'withdrawal' ? '💸' : '💰'}
                      </span>
                      <span className={`${
                        saving.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(saving.amount, saving.currency, saving.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(saving.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate">
                      {saving.comment || '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {saving.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setEditingSaving(saving)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(saving.id!)}
                        disabled={deleteSaving.isPending}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

import { useState } from 'react'
import { CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useSavings, useUpdateSaving } from '../hooks/useSavings.js'
import { Saving } from '../types/savings.js'
import EditSavingModal from '../components/EditSavingModal.js'

export default function Debts() {
  const { data: savings = [], isLoading, error } = useSavings()
  const updateSaving = useUpdateSaving()
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'repaid'>('active')

  // Фільтруємо тільки борги
  const debts = savings.filter(saving => saving.isDebt)

  const filteredDebts = debts.filter(debt => {
    if (filter === 'active') return !debt.isRepaid
    if (filter === 'repaid') return debt.isRepaid
    return true
  })

  // Групуємо борги по людях
  const debtsByPerson = filteredDebts.reduce((acc, debt) => {
    const person = debt.debtTo || 'Без імені'
    if (!acc[person]) {
      acc[person] = {
        name: person,
        debts: [],
        totalOwed: 0,
        totalLent: 0
      }
    }
    acc[person].debts.push(debt)

    if (debt.type === 'withdrawal') {
      // Ви позичили комусь (вам винні)
      acc[person].totalOwed += debt.amount
    } else {
      // Вам позичили (ви винні)
      acc[person].totalLent += debt.amount
    }

    return acc
  }, {} as Record<string, { name: string, debts: Saving[], totalOwed: number, totalLent: number }>)

  const handleMarkAsRepaid = async (debt: Saving) => {
    try {
      await updateSaving.mutateAsync({
        id: debt.id!,
        saving: { isRepaid: !debt.isRepaid }
      })
    } catch (error) {
      console.error('Error updating debt:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      UAH: '₴',
      PLN: 'zł',
      GBP: '£'
    }
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  const totalActiveDebts = debts.filter(d => !d.isRepaid).length
  const totalRepaidDebts = debts.filter(d => d.isRepaid).length

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Борги</h1>
          <p className="mt-2 text-sm text-gray-700">
            Відстежуйте кому ви позичили або хто вам винен.
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📋</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Активні борги</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalActiveDebts}</dd>
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
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Повернені</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalRepaidDebts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Людей</dt>
                  <dd className="text-lg font-medium text-gray-900">{Object.keys(debtsByPerson).length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Фільтри */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Показати:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'active'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Активні ({totalActiveDebts})
            </button>
            <button
              onClick={() => setFilter('repaid')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'repaid'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Повернені ({totalRepaidDebts})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Всі ({debts.length})
            </button>
          </div>
        </div>
      </div>

      {/* Список боргів по людях */}
      {Object.keys(debtsByPerson).length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            💰
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Немає боргів</h3>
          <p className="mt-1 text-sm text-gray-500">
            Позначте транзакції як борги щоб відстежувати їх тут.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(debtsByPerson).map((person) => (
            <div key={person.name} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Заголовок особи */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    👤 {person.name}
                  </h3>
                  <div className="flex space-x-4 text-sm">
                    {person.totalOwed > 0 && (
                      <span className="text-green-600 font-medium">
                        Вам винні: {formatCurrency(person.totalOwed, 'USD')}
                      </span>
                    )}
                    {person.totalLent > 0 && (
                      <span className="text-red-600 font-medium">
                        Ви винні: {formatCurrency(person.totalLent, 'USD')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Список боргів */}
              <div className="divide-y divide-gray-200">
                {person.debts.map((debt) => (
                  <div key={debt.id} className={`p-6 ${debt.isRepaid ? 'bg-gray-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {debt.type === 'withdrawal' ? '💸' : '💰'}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${
                                debt.type === 'withdrawal' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {debt.type === 'withdrawal' ? '↗️' : '↙️'} {formatCurrency(debt.amount, debt.currency)}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                debt.type === 'withdrawal'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {debt.type === 'withdrawal' ? 'Позичили' : 'Взяли'}
                              </span>
                              {debt.isRepaid && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  ✅ Повернено
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(debt.date)} • {debt.comment || 'Без коментаря'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingSaving(debt)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Редагувати"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleMarkAsRepaid(debt)}
                          disabled={updateSaving.isPending}
                          className={`${
                            debt.isRepaid
                              ? 'text-gray-400 hover:text-gray-600'
                              : 'text-green-600 hover:text-green-900'
                          } disabled:opacity-50`}
                          title={debt.isRepaid ? 'Позначити як неповернений' : 'Позначити як повернений'}
                        >
                          {debt.isRepaid ? <XMarkIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

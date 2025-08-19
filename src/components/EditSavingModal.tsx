import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useUpdateSaving } from '../hooks/useSavings.js'
import { Saving, TransactionType } from '../types/savings.js'
import { Currency, CURRENCIES } from '../constants/currencies.js'
import { TRANSACTION_TYPES } from '../constants/transactions.js'

interface EditSavingModalProps {
  saving: Saving
  isOpen: boolean
  onClose: () => void
}



export default function EditSavingModal({ saving, isOpen, onClose }: EditSavingModalProps) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [comment, setComment] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [transactionType, setTransactionType] = useState<TransactionType>('deposit')
  const [isDebt, setIsDebt] = useState(false)
  const [debtTo, setDebtTo] = useState('')
  const [error, setError] = useState('')

  const updateSaving = useUpdateSaving()

  useEffect(() => {
    if (saving) {
      setAmount(saving.amount.toString())
      setDate(saving.date)
      setComment(saving.comment)
      setCurrency(saving.currency)
      setTransactionType(saving.type || 'deposit')
      setIsDebt(saving.isDebt || false)
      setDebtTo(saving.debtTo || '')
    }
  }, [saving])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!amount || !date) {
      setError('Будь ласка, заповніть всі обов\'язкові поля')
      return
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Введіть коректну суму')
      return
    }

    try {
      await updateSaving.mutateAsync({
        id: saving.id!,
        saving: {
          amount: numericAmount,
          date,
          comment: comment.trim(),
          currency: currency as Currency,
          type: transactionType,
          isDebt,
          debtTo: isDebt ? debtTo.trim() : undefined,
        }
      })

      onClose()
    } catch {
      setError('Помилка при збереженні. Спробуйте ще раз.')
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Закрити</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-0 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {transactionType === 'deposit' ? 'Редагувати заощадження' : 'Редагувати зняття'}
                    </Dialog.Title>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Тип операції *
                        </label>
                                                 <div className="grid grid-cols-2 gap-3">
                           {TRANSACTION_TYPES.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setTransactionType(type.value)}
                              className={`relative flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg border transition-colors ${
                                transactionType === type.value
                                  ? type.value === 'deposit'
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span className="mr-2 text-lg">{type.icon}</span>
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                            Сума *
                          </label>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            step="0.01"
                            min="0"
                            required
                            className="input mt-1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="sm:col-span-1">
                          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                            Валюта *
                          </label>
                          <select
                            id="currency"
                            name="currency"
                            className="input mt-1"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                          >
                            {CURRENCIES.map((curr) => (
                              <option key={curr.value} value={curr.value}>
                                {curr.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                          Дата *
                        </label>
                        <input
                          type="date"
                          name="date"
                          id="date"
                          required
                          className="input mt-1"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                          Коментар
                        </label>
                        <textarea
                          name="comment"
                          id="comment"
                          rows={3}
                          className="input mt-1"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Опишіть ваше заощадження..."
                        />
                      </div>

                      {/* Борг */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center">
                          <input
                            id="isDebt"
                            name="isDebt"
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={isDebt}
                            onChange={(e) => setIsDebt(e.target.checked)}
                          />
                          <label htmlFor="isDebt" className="ml-2 block text-sm text-gray-900">
                            💰 Це борг (позичили комусь або взяли у когось)
                          </label>
                        </div>

                        {isDebt && (
                          <div className="mt-3">
                            <label htmlFor="debtTo" className="block text-sm font-medium text-gray-700">
                              {transactionType === 'withdrawal' ? 'Кому позичили' : 'У кого взяли'}
                            </label>
                            <input
                              type="text"
                              name="debtTo"
                              id="debtTo"
                              className="input mt-1"
                              value={debtTo}
                              onChange={(e) => setDebtTo(e.target.value)}
                              placeholder={transactionType === 'withdrawal' ? 'Ім\'я боржника' : 'Ім\'я кредитора'}
                            />
                          </div>
                        )}
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <button
                          type="submit"
                          disabled={updateSaving.isPending}
                          className="btn-primary w-full sm:col-start-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateSaving.isPending ? 'Збереження...' : 'Зберегти'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary mt-3 w-full sm:col-start-1 sm:mt-0"
                          onClick={handleClose}
                        >
                          Скасувати
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

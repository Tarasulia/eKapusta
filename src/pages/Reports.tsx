import { useSavingsStats } from '../hooks/useSavings.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { CHART_COLORS } from '../constants/ui.js'
import { CURRENCY_SYMBOLS, Currency } from '../constants/currencies.js'
import { formatCurrency, formatMonth, calculatePercentage } from '../utils/formatters.js'

export default function Reports() {
  const { data: stats, isLoading, error } = useSavingsStats()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="mt-8 h-64 bg-gray-200 rounded"></div>
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

  if (!stats || stats.totalCount === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          📊
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Немає даних для звітів</h3>
        <p className="mt-1 text-sm text-gray-500">
          Додайте декілька записів, щоб переглянути аналітику.
        </p>
      </div>
    )
  }



  // Prepare data for charts
  const monthlyChartData = stats.monthlyData.map(item => ({
    month: formatMonth(item.month),
    amount: item.total,
    count: item.count
  }))

  const currencyChartData = Object.entries(stats.currencies).map(([currency, amount]) => ({
    name: currency as Currency,
    value: amount,
    percentage: calculatePercentage(amount, stats.totalAmount)
  }))

  return (
    <div className="space-y-6 pb-12">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Звіти</h1>
          <p className="mt-2 text-sm text-gray-700">
            Аналітика ваших заощаджень.
          </p>
        </div>
      </div>

      {/* Баланси по валютах */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(stats.currencies)
          .filter(([, amount]) => amount !== 0) // Показуємо тільки валюти з балансом != 0
          .map(([currency, amount]) => {
            const symbol = CURRENCY_SYMBOLS[currency as Currency] || currency
            const isPositive = amount >= 0

            return (
              <div key={currency} className="card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 ${isPositive ? 'bg-green-500' : 'bg-red-500'} rounded-md flex items-center justify-center`}>
                      <span className="text-white text-sm font-medium">{symbol}</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Баланс {currency}</dt>
                      <dd className={`text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{symbol}{Math.abs(amount).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            )
          })
        }

        {/* Карточка зі статистикою */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">#</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Всього записів</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalCount}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly trend */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Динаміка по місяцях</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Сума']}
                  labelStyle={{ color: '#374151' }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Currency distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Розподіл по валютах</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currencyChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [formatCurrency(value, name as Currency), 'Сума']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Заощадження по місяцях</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'Сума']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Currency breakdown table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Деталізація по валютах</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Валюта
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Сума
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Відсоток
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currencyChartData.map((item, index) => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(item.value, item.name)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

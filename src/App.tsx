import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { PlusIcon, ChartBarIcon, TableCellsIcon, HandRaisedIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import GeneralList from './pages/GeneralList.js'
import Reports from './pages/Reports.js'
import Transactions from './pages/Transactions.js'
import Debts from './pages/Debts.js'
import AddSavingModal from './components/AddSavingModal.js'
import PWAPrompt from './components/PWAPrompt.js'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Перевіряємо URL параметри для швидкого запуску
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('action') === 'add') {
      setIsModalOpen(true)
      // Очищаємо параметр з URL
      navigate(location.pathname, { replace: true })
    }
  }, [location.search, location.pathname, navigate])

  const navigation = [
    { name: 'Список', href: '/', icon: ListBulletIcon, current: location.pathname === '/' },
    { name: 'Транзакції', href: '/transactions', icon: TableCellsIcon, current: location.pathname === '/transactions' },
    { name: 'Борги', href: '/debts', icon: HandRaisedIcon, current: location.pathname === '/debts' },
    { name: 'Звіти', href: '/reports', icon: ChartBarIcon, current: location.pathname === '/reports' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold text-gray-900">💰 еKapusta</h1>
          </div>
        </div>
      </div>

      <div className="lg:flex lg:h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-2xl font-bold text-gray-900">💰 eKapusta</h1>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`${
                        item.current
                          ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-l-lg w-full`}
                    >
                      <Icon
                        className={`${
                          item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-6 w-6`}
                      />
                      {item.name}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1 relative overflow-y-auto">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<GeneralList />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/debts" element={<Debts />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200">
                    <div className="grid grid-cols-4">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`${
                  item.current
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900'
                } flex flex-col items-center justify-center px-3 py-3 text-xs font-medium`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs">{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Add saving modal */}
      <AddSavingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <PWAPrompt />
    </div>
  )
}

export default App
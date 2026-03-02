import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import Header from '../components/layout/Header'

const Dashboard = () => {
  const { settings } = useSettings()
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    activeLoans: 0,
    overdueLoans: 0,
  })

  useEffect(() => {
    // Update CSS variables when settings change
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--color-primary', settings.primary_color)
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--color-secondary', settings.secondary_color)
    }
  }, [settings.primary_color, settings.secondary_color])

  // TODO: Load actual stats from API
  useEffect(() => {
    const loadStats = async () => {
      // This will be implemented when the API is ready
      setStats({
        totalItems: 125,
        availableItems: 89,
        activeLoans: 36,
        overdueLoans: 2,
      })
    }
    loadStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to {settings.school_name || 'EduShare'} Inventory Management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">{stats.totalItems}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Total Items</h3>
                <p className="text-gray-500">All inventory items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-xl">{stats.availableItems}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Available Items</h3>
                <p className="text-gray-500">Ready for loan</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-bold text-xl">{stats.activeLoans}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Active Loans</h3>
                <p className="text-gray-500">Currently borrowed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xl">{stats.overdueLoans}</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Overdue Loans</h3>
                <p className="text-gray-500">Past due date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Add New Item</h3>
              <p className="text-gray-500 text-sm mt-1">Add inventory to the system</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Create Loan</h3>
              <p className="text-gray-500 text-sm mt-1">Lend items to borrowers</p>
            </button>
            <button className="p-4 border border-gray-300 rounded-lg text-left hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900">Generate Report</h3>
              <p className="text-gray-500 text-sm mt-1">Create inventory or loan reports</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Mathematics textbooks loaned</p>
                <p className="text-gray-500 text-sm">To Grade 7 students • 2 hours ago</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Loan</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Science lab equipment returned</p>
                <p className="text-gray-500 text-sm">By Mr. Johnson • 5 hours ago</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Return</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">New sports equipment added</p>
                <p className="text-gray-500 text-sm">By School Admin • Yesterday</p>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Inventory</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
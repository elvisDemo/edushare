import { useState, useEffect } from 'react'
import { 
  Package, BookOpen, AlertTriangle, Users, BarChart, 
  School, Shield, Database, Clock, CheckCircle,
  FlaskRound as Flask
} from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

const Dashboard = () => {
  const { settings } = useSettings()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    activeLoans: 0,
    overdueLoans: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalCategories: 0,
    recentLoans: 0,
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

  // Load dashboard stats based on user role
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Mock data - will be replaced with actual API calls
        const mockStats = {
          totalItems: 125,
          availableItems: 89,
          activeLoans: 36,
          overdueLoans: 2,
          totalUsers: 15,
          activeUsers: 12,
          totalCategories: 8,
          recentLoans: 5,
        }
        setStats(mockStats)
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      }
    }
    loadStats()
  }, [])

  // Super Admin Dashboard
  const SuperAdminDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
            <p className="text-gray-600 mt-1">Complete system-wide statistics and monitoring</p>
          </div>
          <Shield className="h-10 w-10 text-purple-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>{stats.activeUsers} active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
            </div>
            <Package className="h-10 w-10 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>{stats.availableItems} available</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeLoans}</p>
            </div>
            <BookOpen className="h-10 w-10 text-orange-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-red-500">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{stats.overdueLoans} overdue</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
            </div>
            <Database className="h-10 w-10 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Inventory organization</div>
          </div>
        </div>
      </div>
    </div>
  )

  // School Admin Dashboard
  const SchoolAdminDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School Inventory Overview</h2>
            <p className="text-gray-600 mt-1">Manage and monitor school inventory and resources</p>
          </div>
          <School className="h-10 w-10 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
            </div>
            <Package className="h-10 w-10 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>{stats.availableItems} available</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeLoans}</p>
            </div>
            <BookOpen className="h-10 w-10 text-orange-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-red-500">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{stats.overdueLoans} overdue</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Loans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentLoans}</p>
            </div>
            <Clock className="h-10 w-10 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Last 7 days</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
            </div>
            <Database className="h-10 w-10 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Inventory organization</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Librarian Dashboard
  const LibrarianDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Library Management</h2>
            <p className="text-gray-600 mt-1">Manage book loans, returns, and library inventory</p>
          </div>
          <BookOpen className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
            </div>
            <BookOpen className="h-10 w-10 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>{stats.availableItems} available</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeLoans}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Currently borrowed</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overdueLoans}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-red-500">Requires attention</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Returns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentLoans}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Last 7 days</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Lab Technician Dashboard
  const LabTechnicianDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lab Equipment Status</h2>
            <p className="text-gray-600 mt-1">Monitor and manage laboratory equipment and resources</p>
          </div>
          <Flask className="h-10 w-10 text-orange-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</p>
            </div>
            <Package className="h-10 w-10 text-orange-500" />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>{stats.availableItems} available</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Use</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeLoans}</p>
            </div>
            <Clock className="h-10 w-10 text-blue-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Currently checked out</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-yellow-600">Requires attention</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
            </div>
            <Database className="h-10 w-10 text-purple-500" />
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Equipment types</div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null

    switch(user.role) {
      case 'super_admin':
        return <SuperAdminDashboard />
      case 'school_admin':
        return <SchoolAdminDashboard />
      case 'librarian':
        return <LibrarianDashboard />
      case 'lab_technician':
        return <LabTechnicianDashboard />
      default:
        return <SchoolAdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
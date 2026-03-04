import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import SetupWizard from './pages/SetupWizard'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import { SettingsProvider } from './context/SettingsContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import i18n from './i18n'
import './App.css'

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const result = await window.edushareAPI.settings.isSetupComplete()
        setIsSetupComplete(result)
      } catch (error) {
        console.error('Failed to check setup status:', error)
        setIsSetupComplete(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSetup()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading EduShare...</p>
        </div>
      </div>
    )
  }

  // If setup is not complete, show the setup wizard
  if (!isSetupComplete) {
    return <SetupWizard onSetupComplete={() => setIsSetupComplete(true)} />
  }

  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <SettingsProvider>
          <LanguageProvider>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute requiredPermissions={['inventory.read']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/loans" element={
                  <ProtectedRoute requiredPermissions={['loans.read']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">Loans Management</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/returns" element={
                  <ProtectedRoute requiredPermissions={['returns.read']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">Returns Management</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute requiredPermissions={['reports.read']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute requiredPermissions={['users.read']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/system" element={
                  <ProtectedRoute requiredPermissions={['system.*']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/backup" element={
                  <ProtectedRoute requiredPermissions={['backup.*']}>
                    <div className="min-h-screen bg-gray-50 flex">
                      <Sidebar />
                      <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-6">
                          <div className="max-w-7xl mx-auto">
                            <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
                            <p className="text-gray-600 mt-2">Coming soon...</p>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </AuthProvider>
          </LanguageProvider>
        </SettingsProvider>
      </Router>
    </I18nextProvider>
  )
}

export default App
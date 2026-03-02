import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SetupWizard from './pages/SetupWizard'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import { SettingsProvider } from './context/SettingsContext'
import './App.css'

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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
    <Router>
      <SettingsProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login onLogin={() => setIsAuthenticated(true)} />
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
          } />
          <Route path="/settings" element={
            isAuthenticated ? <Settings /> : <Navigate to="/login" />
          } />
          
          {/* Default redirect */}
          <Route path="/" element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} />
          } />
        </Routes>
      </SettingsProvider>
    </Router>
  )
}

export default App
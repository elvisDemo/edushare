import { useEffect, useState } from 'react'
import SetupWizard from './pages/SetupWizard'
import Login from './pages/Login'
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

  // If setup is complete, show the login screen
  return <Login />
}

export default App
import { useState, useEffect } from 'react'
import { LogIn, School } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'

const Login = ({ onLogin }) => {
  const { settings } = useSettings()
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Update CSS variables when settings change
  useEffect(() => {
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--color-primary', settings.primary_color)
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--color-secondary', settings.secondary_color)
    }
  }, [settings.primary_color, settings.secondary_color])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await window.edushareAPI.auth.login(credentials)
      if (result.success) {
        // Login successful - call onLogin callback
        console.log('Login successful:', result.data)
        if (onLogin) {
          onLogin()
        }
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title with School Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
               style={{ backgroundColor: `${settings.primary_color || '#3B82F6'}20` }}>
            <School className="h-8 w-8" style={{ color: settings.primary_color || '#3B82F6' }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {settings.school_name || 'EduShare'}
          </h1>
          {settings.school_motto && (
            <p className="text-gray-600 mt-1 italic">"{settings.school_motto}"</p>
          )}
          <p className="text-gray-600 mt-2">School Inventory Management System</p>
          {settings.school_address && (
            <p className="text-gray-500 text-sm mt-1">{settings.school_address}</p>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: settings.primary_color || '#3B82F6',
                '--tw-ring-color': settings.primary_color || '#3B82F6'
              }}
            >
              <LogIn className="mr-2 h-5 w-5" />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <a
                href="#"
                className="text-sm hover:text-blue-500"
                style={{ color: settings.primary_color || '#3B82F6' }}
                onClick={(e) => {
                  e.preventDefault()
                  alert('Recovery feature not implemented yet')
                }}
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            Need help? Contact your system administrator.
            <br />
            EduShare v1.0 • School Inventory Management
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
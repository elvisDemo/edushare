import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LogIn, School, Globe, Eye, EyeOff, AlertCircle, FileText } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import RecoveryModal from '../components/ui/RecoveryModal'

const Login = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { settings } = useSettings()
  const { currentLanguage, toggleLanguage, isEnglish, isSwahili } = useLanguage()
  const { login, isAuthenticated } = useAuth()
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Update CSS variables when settings change
  useEffect(() => {
    if (settings.primary_color) {
      document.documentElement.style.setProperty('--color-primary', settings.primary_color)
    }
    if (settings.secondary_color) {
      document.documentElement.style.setProperty('--color-secondary', settings.secondary_color)
    }
  }, [settings.primary_color, settings.secondary_color])

  // Load language from settings on mount
  useEffect(() => {
    const loadLanguageFromSettings = async () => {
      try {
        if (settings.language && settings.language !== currentLanguage) {
          // Language will be updated via LanguageContext when settings change
        }
      } catch (err) {
        console.error('Failed to load language from settings:', err)
      }
    }
    loadLanguageFromSettings()
  }, [settings.language, currentLanguage])

  const validateForm = () => {
    const errors = {}
    
    // Username validation: 3-50 characters
    if (credentials.username.length < 3) {
      errors.username = t('login.validation.usernameMin')
    } else if (credentials.username.length > 50) {
      errors.username = t('login.validation.usernameMax')
    }
    
    // Password validation: minimum 8 characters
    if (credentials.password.length > 0 && credentials.password.length < 8) {
      errors.password = t('login.validation.passwordMin')
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})
    
    // Validate form
    if (!validateForm()) {
      return
    }
    
    // Check required fields
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError(t('login.errors.required'))
      return
    }
    
    setIsLoading(true)

    try {
      const result = await login(credentials.username, credentials.password)
      if (result.success) {
        // Login successful - redirect to dashboard
        console.log('Login successful')
        navigate('/dashboard')
      } else {
        setError(result.error || t('login.errors.invalidCredentials'))
      }
    } catch (err) {
      console.error('Login error:', err)
      // Handle different types of errors
      if (err.message.includes('Network') || err.message.includes('fetch')) {
        setError(t('login.errors.networkError'))
      } else if (err.message.includes('IPC') || err.message.includes('server')) {
        setError(t('login.errors.serverError'))
      } else {
        setError(err.message || t('login.errors.invalidCredentials'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }))
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleKeyDown = (e) => {
    // Submit on Enter key
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" role="main" aria-label="Login page">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label={t('language.toggle')}
            title={t('language.toggle')}
          >
            <Globe className="h-4 w-4" />
            <span>{isEnglish ? 'EN' : 'SW'}</span>
            <span className="sr-only">{t('language.toggle')}</span>
          </button>
        </div>

        {/* Logo and Title with School Branding */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" 
            style={{ backgroundColor: `${settings.primary_color || '#3B82F6'}20` }}
            role="img"
            aria-label="School logo"
          >
            <School className="h-8 w-8" style={{ color: settings.primary_color || '#3B82F6' }} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {settings.school_name || 'EduShare'}
          </h1>
          {settings.school_motto && (
            <p className="text-gray-600 mt-1 italic">"{settings.school_motto}"</p>
          )}
          <p className="text-gray-600 mt-2">{t('login.systemName')}</p>
          {settings.school_address && (
            <p className="text-gray-500 text-sm mt-1">{settings.school_address}</p>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            {t('login.title')}
          </h2>

          {error && (
            <div 
              className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.username')}
              </label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  validationErrors.username 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={t('login.usernamePlaceholder')}
                required
                disabled={isLoading}
                aria-required="true"
                aria-invalid={!!validationErrors.username}
                aria-describedby={validationErrors.username ? 'username-error' : undefined}
                autoComplete="username"
              />
              {validationErrors.username && (
                <p id="username-error" className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 ${
                    validationErrors.password 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder={t('login.passwordPlaceholder')}
                  required
                  disabled={isLoading}
                  aria-required="true"
                  aria-invalid={!!validationErrors.password}
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ 
                backgroundColor: settings.primary_color || '#3B82F6',
                '--tw-ring-color': settings.primary_color || '#3B82F6'
              }}
              aria-busy={isLoading}
            >
              <LogIn className="mr-2 h-5 w-5" />
              {isLoading ? t('login.signingIn') : t('login.signIn')}
            </button>
          </form>

          {/* Recovery and Help Links */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
            <div className="text-center">
              <button
                onClick={() => setShowRecoveryModal(true)}
                className="text-sm hover:text-blue-500 flex items-center justify-center gap-2 mx-auto"
                style={{ color: settings.primary_color || '#3B82F6' }}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4" />
                {t('login.recoverAccess')}
              </button>
            </div>
            <div className="text-center">
              <a
                href="#"
                className="text-sm hover:text-blue-500"
                style={{ color: settings.primary_color || '#3B82F6' }}
                onClick={(e) => {
                  e.preventDefault()
                  // TODO: Implement password reset flow
                  alert('Password reset feature will be implemented in a future update')
                }}
              >
                {t('login.forgotPassword')}
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            {t('login.needHelp')}
            <br />
            {t('login.version')}
          </p>
        </div>
      </div>

      {/* Recovery Modal */}
      <RecoveryModal 
        isOpen={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        primaryColor={settings.primary_color || '#3B82F6'}
      />
    </div>
  )
}

export default Login
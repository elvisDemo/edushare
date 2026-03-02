import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    school_name: '',
    school_motto: '',
    school_address: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    language: 'en',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const result = await window.edushareAPI.settings.getAll()
      if (result.success) {
        setSettings(prev => ({
          ...prev,
          ...result.data
        }))
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (newSettings) => {
    try {
      // Update each setting individually
      const updates = Object.entries(newSettings).map(([key, value]) =>
        window.edushareAPI.settings.set(key, value)
      )
      
      await Promise.all(updates)
      
      // Reload settings to ensure consistency
      await loadSettings()
      return { success: true }
    } catch (error) {
      console.error('Failed to update settings:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    settings,
    isLoading,
    loadSettings,
    updateSettings,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
import { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en')

  useEffect(() => {
    // Update state when language changes externally
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng)
    }

    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [i18n])

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setCurrentLanguage(lng)
    
    // Also update in settings if available
    if (window.edushareAPI?.settings?.set) {
      window.edushareAPI.settings.set('language', lng).catch(console.error)
    }
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'sw' : 'en'
    changeLanguage(newLang)
  }

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isEnglish: currentLanguage === 'en',
    isSwahili: currentLanguage === 'sw'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
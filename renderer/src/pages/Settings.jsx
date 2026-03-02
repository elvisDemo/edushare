import { useState, useEffect } from 'react'
import { Save, Upload, Palette, Building, MapPin, BookOpen } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import Header from '../components/layout/Header'

const Settings = () => {
  const { settings, updateSettings, isLoading } = useSettings()
  const [formData, setFormData] = useState({
    school_name: '',
    school_motto: '',
    school_address: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    if (settings) {
      setFormData({
        school_name: settings.school_name || '',
        school_motto: settings.school_motto || '',
        school_address: settings.school_address || '',
        primary_color: settings.primary_color || '#3B82F6',
        secondary_color: settings.secondary_color || '#10B981',
      })
    }
  }, [settings])

  useEffect(() => {
    // Update CSS variables when form colors change
    if (formData.primary_color) {
      document.documentElement.style.setProperty('--color-primary', formData.primary_color)
    }
    if (formData.secondary_color) {
      document.documentElement.style.setProperty('--color-secondary', formData.secondary_color)
    }
  }, [formData.primary_color, formData.secondary_color])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage({ type: '', text: '' })

    try {
      const result = await updateSettings(formData)
      if (result.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
        
        // Clear message after 3 seconds
        setTimeout(() => {
          setSaveMessage({ type: '', text: '' })
        }, 3000)
      } else {
        setSaveMessage({ type: 'error', text: result.error || 'Failed to save settings' })
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: error.message || 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetColors = () => {
    setFormData(prev => ({
      ...prev,
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your school branding and application settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Branding settings */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    School Branding
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Customize how EduShare appears with your school's identity
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Save message */}
                  {saveMessage.text && (
                    <div className={`rounded-md p-4 ${
                      saveMessage.type === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-sm ${
                        saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {saveMessage.text}
                      </p>
                    </div>
                  )}

                  {/* School Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Logo
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="School logo preview"
                            className="h-24 w-24 rounded-lg object-cover border border-gray-300"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            <Building className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <label
                            htmlFor="logo-upload"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Logo
                          </label>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleLogoChange}
                          />
                          {logoFile && (
                            <button
                              type="button"
                              onClick={() => {
                                setLogoFile(null)
                                setLogoPreview(null)
                              }}
                              className="ml-3 text-sm text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: Square PNG or JPG, at least 200×200 pixels
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* School Name */}
                  <div>
                    <label htmlFor="school_name" className="block text-sm font-medium text-gray-700 mb-1">
                      School Name *
                    </label>
                    <input
                      type="text"
                      id="school_name"
                      name="school_name"
                      value={formData.school_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your school name"
                      required
                    />
                  </div>

                  {/* School Motto */}
                  <div>
                    <label htmlFor="school_motto" className="block text-sm font-medium text-gray-700 mb-1">
                      School Motto
                    </label>
                    <input
                      type="text"
                      id="school_motto"
                      name="school_motto"
                      value={formData.school_motto}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your school motto"
                    />
                  </div>

                  {/* School Address */}
                  <div>
                    <label htmlFor="school_address" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      School Address *
                    </label>
                    <textarea
                      id="school_address"
                      name="school_address"
                      value={formData.school_address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your school's physical address"
                      required
                    />
                  </div>

                  {/* Color Scheme */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Palette className="mr-1 h-4 w-4" />
                        Color Scheme
                      </label>
                      <button
                        type="button"
                        onClick={handleResetColors}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Reset to defaults
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="primary_color"
                            name="primary_color"
                            value={formData.primary_color}
                            onChange={handleInputChange}
                            className="w-12 h-12 cursor-pointer rounded border border-gray-300"
                          />
                          <div>
                            <input
                              type="text"
                              value={formData.primary_color}
                              onChange={handleInputChange}
                              name="primary_color"
                              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for buttons, headers, and accents</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="secondary_color"
                            name="secondary_color"
                            value={formData.secondary_color}
                            onChange={handleInputChange}
                            className="w-12 h-12 cursor-pointer rounded border border-gray-300"
                          />
                          <div>
                            <input
                              type="text"
                              value={formData.secondary_color}
                              onChange={handleInputChange}
                              name="secondary_color"
                              className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for highlights and secondary elements</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Color preview */}
                    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                      <p className="text-xs font-medium text-gray-700 mb-2">Preview:</p>
                      <div className="flex space-x-2">
                        <div 
                          className="h-8 flex-1 rounded flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: formData.primary_color }}
                        >
                          Primary
                        </div>
                        <div 
                          className="h-8 flex-1 rounded flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: formData.secondary_color }}
                        >
                          Secondary
                        </div>
                        <div 
                          className="h-8 flex-1 rounded flex items-center justify-center text-white text-xs font-medium"
                          style={{ 
                            backgroundColor: formData.primary_color,
                            opacity: 0.8 
                          }}
                        >
                          Hover
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: formData.primary_color,
                      '--tw-ring-color': formData.primary_color
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right column: Preview and help */}
          <div className="space-y-6">
            {/* Branding Preview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Branding Preview
              </h3>
              
              <div className="space-y-4">
                {/* Logo preview */}
                <div className="text-center p-4 border border-gray-200 rounded-md">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3" 
                       style={{ backgroundColor: `${formData.primary_color}20` }}>
                    {logoPreview ? (
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Building 
                        className="h-8 w-8" 
                        style={{ color: formData.primary_color }}
                      />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900">{formData.school_name || 'Your School Name'}</h4>
                  {formData.school_motto && (
                    <p className="text-gray-600 text-sm italic mt-1">"{formData.school_motto}"</p>
                  )}
                  <p className="text-gray-500 text-xs mt-2">Login Screen Header</p>
                </div>

                {/* Button preview */}
                <div className="p-4 border border-gray-200 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-2">Button Styles:</p>
                  <div className="space-y-2">
                    <button
                      type="button"
                      className="w-full py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: formData.primary_color }}
                    >
                      Primary Button
                    </button>
                    <button
                      type="button"
                      className="w-full py-2 rounded text-sm font-medium border"
                      style={{ 
                        borderColor: formData.primary_color,
                        color: formData.primary_color
                      }}
                    >
                      Secondary Button
                    </button>
                  </div>
                </div>

                {/* Report header preview */}
                <div className="p-4 border border-gray-200 rounded-md">
                  <p className="text-xs font-medium text-gray-700 mb-2">Report Header:</p>
                  <div className="border border-gray-300 rounded p-3">
                    <div className="flex items-center mb-2">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="h-8 w-8 mr-2"
                        />
                      ) : (
                        <div 
                          className="h-8 w-8 rounded mr-2 flex items-center justify-center"
                          style={{ backgroundColor: formData.primary_color }}
                        >
                          <span className="text-white text-xs font-bold">
                            {formData.school_name?.charAt(0) || 'S'}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm" style={{ color: formData.primary_color }}>
                          {formData.school_name || 'School Name'}
                        </p>
                        <p className="text-xs text-gray-600">{formData.school_address || 'School Address'}</p>
                      </div>
                    </div>
                    <div className="h-px w-full my-2" style={{ backgroundColor: formData.primary_color }}></div>
                    <p className="text-xs text-gray-500">Inventory Report • March 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Branding Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                  Use your school's official colors for consistency
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                  The logo will appear on login screens, headers, and PDF reports
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                  Changes take effect immediately across the application
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                  Branding is included in all exported PDF reports
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2 flex-shrink-0"></span>
                  Settings are saved automatically and persist across app restarts
                </li>
              </ul>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Only users with "School Admin" or "Super Admin" roles can modify branding settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Settings

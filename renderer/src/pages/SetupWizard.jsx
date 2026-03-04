import { useState } from 'react'
import { CheckCircle, Globe, School, User, Shield, Save } from 'lucide-react'

const SetupWizard = ({ onSetupComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [language, setLanguage] = useState('en')
  const [schoolData, setSchoolData] = useState({
    name: '',
    motto: '',
    address: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
  })
  const [adminData, setAdminData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  })
  const [recoveryFileInfo, setRecoveryFileInfo] = useState({ saved: false, filePath: null, error: null })
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const steps = [
    { id: 1, title: 'Language', icon: Globe },
    { id: 2, title: 'School Branding', icon: School },
    { id: 3, title: 'Super Admin', icon: User },
    { id: 4, title: 'Recovery File', icon: Shield },
    { id: 5, title: 'Complete', icon: CheckCircle },
  ]

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!language) newErrors.language = 'Please select a language'
    }

    if (step === 2) {
      if (!schoolData.name.trim()) newErrors.name = 'School name is required'
      if (!schoolData.address.trim()) newErrors.address = 'School address is required'
    }

    if (step === 3) {
      if (!adminData.username.trim()) newErrors.username = 'Username is required'
      if (adminData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'
      if (!adminData.password) newErrors.password = 'Password is required'
      if (adminData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
      if (adminData.password !== adminData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
      if (!adminData.fullName.trim()) newErrors.fullName = 'Full name is required'
    }

    if (step === 4) {
      if (!recoveryFileInfo.saved) {
        newErrors.recoveryFile = 'You must save the recovery file to continue'
      } else if (recoveryFileInfo.error) {
        newErrors.recoveryFile = recoveryFileInfo.error
      }
      // Note: We trust the IPC handler that created the file
      // If the user deletes it after generation, that's their responsibility
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerateRecoveryFile = async () => {
    try {
      setIsSaving(true)
      const result = await window.edushareAPI.recovery.generate()
      if (result.success) {
        setRecoveryFileInfo({ saved: true, filePath: result.filePath, error: null })
        setErrors({ ...errors, recoveryFile: undefined })
      } else {
        setRecoveryFileInfo({ saved: false, filePath: null, error: result.error })
        setErrors({ ...errors, recoveryFile: result.error })
      }
    } catch (error) {
      setRecoveryFileInfo({ saved: false, filePath: null, error: error.message })
      setErrors({ ...errors, recoveryFile: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCompleteSetup = async () => {
    try {
      setIsSaving(true)

      // Verify recovery file exists before proceeding
      if (recoveryFileInfo.saved && recoveryFileInfo.filePath) {
        try {
          // Use IPC to verify file exists and is accessible
          const verification = await window.edushareAPI.utils.verifyFile(recoveryFileInfo.filePath);
          if (!verification.success) {
            throw new Error(`Recovery file verification failed: ${verification.error}`);
          }
          console.log('[SetupWizard] Recovery file verified:', verification.data);
        } catch (fileError) {
          setErrors({ ...errors, submit: `${fileError.message}. Please regenerate the recovery file.` });
          setIsSaving(false);
          return;
        }
      } else {
        setErrors({ ...errors, submit: 'Recovery file is required to complete setup' });
        setIsSaving(false);
        return;
      }

      // Save language
      await window.edushareAPI.settings.set('language', language)

      // Save school branding
      await window.edushareAPI.settings.set('school_name', schoolData.name)
      await window.edushareAPI.settings.set('school_motto', schoolData.motto)
      await window.edushareAPI.settings.set('school_address', schoolData.address)
      await window.edushareAPI.settings.set('primary_color', schoolData.primaryColor)
      await window.edushareAPI.settings.set('secondary_color', schoolData.secondaryColor)

      // Create Super Admin user
      await window.edushareAPI.users.create({
        username: adminData.username,
        password: adminData.password,
        full_name: adminData.fullName,
        role: 'super_admin',
      })

      // Mark setup as complete
      await window.edushareAPI.settings.set('setup_complete', 'true')

      onSetupComplete()
    } catch (error) {
      setErrors({ ...errors, submit: error.message })
      setIsSaving(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Select Language</h3>
            <p className="text-gray-600">Choose the default language for your EduShare installation.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-6 border-2 rounded-lg text-center transition-all ${language === 'en' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-2xl mb-2">🇬🇧</div>
                <div className="font-medium">English</div>
                <div className="text-sm text-gray-500 mt-1">Default language</div>
              </button>
              
              <button
                type="button"
                onClick={() => setLanguage('sw')}
                className={`p-6 border-2 rounded-lg text-center transition-all ${language === 'sw' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-2xl mb-2">🇹🇿</div>
                <div className="font-medium">Swahili</div>
                <div className="text-sm text-gray-500 mt-1">Kiswahili</div>
              </button>
            </div>
            
            {errors.language && <p className="text-red-600 text-sm">{errors.language}</p>}
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">School Branding</h3>
            <p className="text-gray-600">Customize EduShare with your school's identity.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  value={schoolData.name}
                  onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mlimani Primary School"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Motto
                </label>
                <input
                  type="text"
                  value={schoolData.motto}
                  onChange={(e) => setSchoolData({ ...schoolData, motto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Strive for Excellence"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Address *
                </label>
                <textarea
                  value={schoolData.address}
                  onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Full physical address of the school"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={schoolData.primaryColor}
                      onChange={(e) => setSchoolData({ ...schoolData, primaryColor: e.target.value })}
                      className="w-12 h-12 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{schoolData.primaryColor}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={schoolData.secondaryColor}
                      onChange={(e) => setSchoolData({ ...schoolData, secondaryColor: e.target.value })}
                      className="w-12 h-12 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{schoolData.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Create Super Admin Account</h3>
            <p className="text-gray-600">Create the master administrator account for EduShare.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={adminData.fullName}
                  onChange={(e) => setAdminData({ ...adminData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., John Doe"
                />
                {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={adminData.username}
                  onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., admin"
                />
                {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={adminData.password}
                    onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="At least 8 characters"
                  />
                  {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={adminData.confirmPassword}
                    onChange={(e) => setAdminData({ ...adminData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> This Super Admin account has full control over the system.
                  Keep the credentials secure. You can create additional staff accounts later.
                </p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Generate Recovery File</h3>
            <p className="text-gray-600">
              Create a recovery file that will be required if you forget the Super Admin password.
              <strong className="block mt-2">Save this file to a USB drive and keep it in a secure location.</strong>
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-6 text-center">
              <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h4 className="font-semibold text-blue-900 mb-2">Recovery File Security</h4>
              <p className="text-blue-700 text-sm mb-4">
                This file is cryptographically signed to your installation. It can be used to:
              </p>
              <ul className="text-blue-700 text-sm text-left space-y-1 mb-6">
                <li>• Reset the Super Admin password if forgotten</li>
                <li>• Restore from backup if the database is lost</li>
                <li>• Recover access to the system</li>
              </ul>
              
              {recoveryFileInfo.saved ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Recovery file saved successfully!</span>
                  </div>
                  <p className="text-green-600 text-sm mt-2">
                    File saved to: <code className="bg-green-100 px-2 py-1 rounded text-xs">{recoveryFileInfo.filePath}</code>
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    Please keep the USB drive in a secure location. You can now continue.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateRecoveryFile}
                  disabled={isSaving}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isSaving ? 'Generating...' : 'Generate and Save Recovery File'}
                </button>
              )}
              
              {errors.recoveryFile && <p className="text-red-600 text-sm mt-4">{errors.recoveryFile}</p>}
              
              <div className="mt-6 pt-6 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  <strong>Warning:</strong> Without this recovery file, you may permanently lose access to the system
                  if the Super Admin password is forgotten.
                </p>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">Setup Complete!</h3>
            <p className="text-gray-600">
              Your EduShare installation is ready to use. Review the summary below before completing.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h4 className="font-medium text-gray-900 mb-4">Setup Summary</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{language === 'en' ? 'English' : 'Swahili'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">School Name:</span>
                  <span className="font-medium">{schoolData.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Super Admin:</span>
                  <span className="font-medium">{adminData.fullName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Recovery File:</span>
                  <span className="font-medium text-green-600">
                    {recoveryFileInfo.saved ? 'Saved ✓' : 'Not Saved ✗'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800">
                <strong>Final Step:</strong> Click "Complete Setup" to save all settings and create the Super Admin account.
              </p>
            </div>
            
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">EduShare Setup Wizard</h1>
              <p className="text-blue-100 mt-2">Configure your school inventory management system</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">Step {currentStep} of {steps.length}</div>
              <div className="text-blue-200">Setup Progress</div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-8 pt-6">
          <div className="flex justify-between relative">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-blue-600 bg-blue-50 text-blue-600' : isCompleted ? 'border-green-600 bg-green-50 text-green-600' : 'border-gray-300 bg-gray-50 text-gray-400'}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                    {step.title}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-6 left-12 w-full h-0.5 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'}`} style={{ width: 'calc(100% - 48px)' }}></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSaving}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteSetup}
              disabled={isSaving || !recoveryFileInfo.saved}
              className="px-6 py-2 bg-green-600 border border-transparent rounded-md text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-500 text-sm max-w-2xl">
        <p>
          <strong>Note:</strong> This setup wizard runs only once on first launch.
          You can change language and school branding later in Settings.
        </p>
      </div>
    </div>
  )
}

export default SetupWizard

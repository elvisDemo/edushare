import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react'

const RecoveryModal = ({ isOpen, onClose, primaryColor = '#3B82F6' }) => {
  const { t } = useTranslation()
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  if (!isOpen) return null

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file extension
      if (!file.name.endsWith('.esrec')) {
        setError('Please select a valid recovery file (.esrec)')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a recovery file')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1] // Remove data URL prefix
        
        try {
          // Call recovery API
          const result = await window.edushareAPI.recovery.reset({
            recoveryData: base64Data
          })
          
          if (result.success) {
            // Show success with credentials
            setSuccess({
              username: result.data.username,
              password: result.data.password
            })
          } else {
            setError(result.error || 'Recovery failed')
          }
        } catch (apiError) {
          setError(apiError.message || 'Recovery failed. Please try again.')
        } finally {
          setIsProcessing(false)
        }
      }
      
      reader.onerror = () => {
        setError('Failed to read file')
        setIsProcessing(false)
      }
      
      reader.readAsDataURL(selectedFile)
    } catch (err) {
      setError(err.message || 'An error occurred')
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setError('')
    setSuccess(null)
    setIsProcessing(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="recovery-modal-title">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md" style={{ backgroundColor: `${primaryColor}20` }}>
                <FileText className="h-6 w-6" style={{ color: primaryColor }} />
              </div>
              <div>
                <h3 id="recovery-modal-title" className="text-lg font-semibold text-gray-900">
                  {t('recovery.title')}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t('recovery.description')}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-500 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label={t('common.close')}
              disabled={isProcessing}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Recovery Successful!
                </h4>
                <p className="text-gray-600 mb-4">
                  Your Super Admin account has been reset. Use these credentials to login:
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Username</p>
                      <p className="text-lg font-mono font-bold text-gray-900">{success.username}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Temporary Password</p>
                      <p className="text-lg font-mono font-bold text-gray-900">{success.password}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Save this password and change it immediately after login.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-6 px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  style={{ backgroundColor: primaryColor }}
                >
                  Close and Login
                </button>
              </div>
            ) : (
              <>
                {/* Instructions */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    {t('recovery.instructions')}
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0 mt-0.5">
                        1
                      </span>
                      {t('recovery.step1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0 mt-0.5">
                        2
                      </span>
                      {t('recovery.step2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0 mt-0.5">
                        3
                      </span>
                      {t('recovery.step3')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0 mt-0.5">
                        4
                      </span>
                      {t('recovery.step4')}
                    </li>
                  </ul>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Recovery File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="recovery-file"
                          className="relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2"
                          style={{ color: primaryColor }}
                        >
                          <span>{t('recovery.browse')}</span>
                          <input
                            id="recovery-file"
                            name="recovery-file"
                            type="file"
                            className="sr-only"
                            accept=".esrec"
                            onChange={handleFileSelect}
                            disabled={isProcessing}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        .esrec files only
                      </p>
                    </div>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-gray-500"
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* No File Help */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800 font-medium mb-1">
                    {t('recovery.noFile')}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t('recovery.contactAdmin')}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!success && (
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                disabled={isProcessing}
              >
                {t('recovery.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || isProcessing}
                className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                {isProcessing ? 'Processing...' : t('recovery.submit')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecoveryModal
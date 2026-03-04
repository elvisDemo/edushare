import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, requiredPermissions = [] }) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if user has all required permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    )
    
    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h2>
              <p className="text-red-600">
                You don't have permission to access this page. 
                Your role ({user?.role}) doesn't have the required permissions.
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  return children
}

export default ProtectedRoute
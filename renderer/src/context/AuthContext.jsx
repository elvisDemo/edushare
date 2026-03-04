import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get current user from session
        const result = await window.edushareAPI.auth.getCurrentUser();
        if (result.success && result.data) {
          setUser(result.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      setIsLoading(true);
      const result = await window.edushareAPI.auth.login({ username, password });
      
      if (result.success) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check your connection.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await window.edushareAPI.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user has permission for a specific action
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Define role permissions
    const rolePermissions = {
      school_admin: [
        'inventory.*',
        'loans.*',
        'returns.*',
        'reports.*',
        'users.*',
        'settings.branding',
        'settings.categories',
        'backup.*'
      ],
      librarian: [
        'inventory.*',
        'loans.*',
        'returns.*',
        'reports.read'
      ],
      lab_technician: [
        'inventory.*',
        'loans.*',
        'returns.*',
        'reports.read'
      ]
    };

    const permissions = rolePermissions[user.role] || [];
    
    // Check for exact permission or wildcard
    return permissions.includes(permission) || 
           permissions.includes(permission.split('.')[0] + '.*') ||
           permissions.includes('*');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
import { useState } from 'react'
import { Menu, X, Bell, User, Settings, LogOut, Home, Package, BookOpen, RefreshCw, BarChart, Users, Shield, Database } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { settings } = useSettings()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
    ]

    if (!user) return baseItems

    // Common items for all authenticated users
    const commonItems = [
      { name: 'Inventory', href: '#', icon: Package, permission: 'inventory.read' },
      { name: 'Loans', href: '#', icon: BookOpen, permission: 'loans.read' },
      { name: 'Returns', href: '#', icon: RefreshCw, permission: 'returns.read' },
      { name: 'Reports', href: '#', icon: BarChart, permission: 'reports.read' },
    ]

    // Role-specific items
    const roleSpecificItems = []
    
    if (user.role === 'super_admin') {
      roleSpecificItems.push(
        { name: 'Users', href: '#', icon: Users, permission: 'users.read' },
        { name: 'System', href: '#', icon: Shield, permission: 'system.*' },
        { name: 'Backup', href: '#', icon: Database, permission: 'backup.*' }
      )
    }

    if (user.role === 'school_admin') {
      roleSpecificItems.push(
        { name: 'Users', href: '#', icon: Users, permission: 'users.read' },
        { name: 'Backup', href: '#', icon: Database, permission: 'backup.*' }
      )
    }

    // Settings is available for all authenticated users
    const settingsItem = { name: 'Settings', href: '#', icon: Settings }

    return [...baseItems, ...commonItems, ...roleSpecificItems, settingsItem]
  }

  const navigation = getNavigationItems()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and navigation */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>

            {/* Logo and school name */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                     style={{ backgroundColor: `${settings.primary_color || '#3B82F6'}20` }}>
                  <span className="font-bold" style={{ color: settings.primary_color || '#3B82F6' }}>
                    {settings.school_name?.charAt(0) || 'E'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  {settings.school_name || 'EduShare'}
                </h1>
                {settings.school_motto && (
                  <p className="text-xs text-gray-500 italic">"{settings.school_motto}"</p>
                )}
              </div>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.current
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={item.current ? { backgroundColor: settings.primary_color || '#3B82F6' } : {}}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Right side: User menu and notifications */}
          <div className="flex items-center">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* User menu */}
            <div className="ml-3 relative">
              <div>
                <button
                  type="button"
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="user-menu-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{ '--tw-ring-color': settings.primary_color || '#3B82F6' }}
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {user?.avatar ? (
                      <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-2 hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-700">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">
                      {user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'No Role'}
                    </p>
                  </div>
                </button>
              </div>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                >
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <User className="mr-3 h-4 w-4 text-gray-400" />
                      Your Profile
                    </div>
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <Settings className="mr-3 h-4 w-4 text-gray-400" />
                      Settings
                    </div>
                  </a>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-3 h-4 w-4 text-gray-400" />
                      Sign out
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  item.current
                    ? 'text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={item.current ? { backgroundColor: settings.primary_color || '#3B82F6' } : {}}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
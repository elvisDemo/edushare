import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Package, BookOpen, RefreshCw, BarChart, Users, 
  Shield, Database, Settings, ChevronLeft, ChevronRight,
  School, Book, FlaskRound as Flask
} from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { useAuth } from '../../context/AuthContext'

const Sidebar = () => {
  const { settings } = useSettings()
  const { user, hasPermission } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return []

    const baseItems = [
      { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: Home, 
        permission: null // Always visible when authenticated
      },
    ]

    // Common items for all authenticated users
    const commonItems = [
      { 
        name: 'Inventory', 
        href: '/inventory', 
        icon: Package, 
        permission: 'inventory.read' 
      },
      { 
        name: 'Loans', 
        href: '/loans', 
        icon: BookOpen, 
        permission: 'loans.read' 
      },
      { 
        name: 'Returns', 
        href: '/returns', 
        icon: RefreshCw, 
        permission: 'returns.read' 
      },
      { 
        name: 'Reports', 
        href: '/reports', 
        icon: BarChart, 
        permission: 'reports.read' 
      },
    ]

    // Role-specific items
    const roleSpecificItems = []
    
    if (user.role === 'super_admin') {
      roleSpecificItems.push(
        { 
          name: 'Users', 
          href: '/users', 
          icon: Users, 
          permission: 'users.read' 
        },
        { 
          name: 'System', 
          href: '/system', 
          icon: Shield, 
          permission: 'system.*' 
        },
        { 
          name: 'Backup', 
          href: '/backup', 
          icon: Database, 
          permission: 'backup.*' 
        }
      )
    }

    if (user.role === 'school_admin') {
      roleSpecificItems.push(
        { 
          name: 'Users', 
          href: '/users', 
          icon: Users, 
          permission: 'users.read' 
        },
        { 
          name: 'Backup', 
          href: '/backup', 
          icon: Database, 
          permission: 'backup.*' 
        }
      )
    }

    // Settings is available for all authenticated users
    const settingsItem = { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings, 
      permission: null 
    }

    // Combine all items
    const allItems = [...baseItems, ...commonItems, ...roleSpecificItems, settingsItem]
    
    // Filter items based on permissions
    return allItems.filter(item => 
      item.permission === null || hasPermission(item.permission)
    )
  }

  const navigationItems = getNavigationItems()

  // Get role-specific icon and color
  const getRoleInfo = () => {
    switch(user?.role) {
      case 'super_admin':
        return { icon: Shield, color: 'text-purple-600 bg-purple-100' }
      case 'school_admin':
        return { icon: School, color: 'text-blue-600 bg-blue-100' }
      case 'librarian':
        return { icon: Book, color: 'text-green-600 bg-green-100' }
      case 'lab_technician':
        return { icon: Flask, color: 'text-orange-600 bg-orange-100' }
      default:
        return { icon: Users, color: 'text-gray-600 bg-gray-100' }
    }
  }

  const roleInfo = getRoleInfo()
  const RoleIcon = roleInfo.icon

  return (
    <div className={`flex flex-col h-full transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            {settings.logo ? (
              <img 
                src={settings.logo} 
                alt="School Logo" 
                className="h-8 w-8 rounded"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
              >
                {settings.school_name?.charAt(0) || 'E'}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-gray-800">
                {settings.school_name || 'EduShare'}
              </h2>
              <div className="flex items-center space-x-1">
                <div className={`h-2 w-2 rounded-full ${roleInfo.color.split(' ')[1]}`}></div>
                <span className="text-xs text-gray-500">
                  {user?.role ? user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {collapsed && (
          <div className="flex justify-center w-full">
            {settings.logo ? (
              <img 
                src={settings.logo} 
                alt="School Logo" 
                className="h-8 w-8 rounded"
              />
            ) : (
              <div 
                className="h-8 w-8 rounded flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: settings.primary_color || '#3B82F6' }}
              >
                {settings.school_name?.charAt(0) || 'E'}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => `
                flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} 
                px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'text-white' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              style={({ isActive }) => isActive ? { 
                backgroundColor: settings.primary_color || '#3B82F6' 
              } : {}}
              title={collapsed ? item.name : ''}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* User info at bottom */}
      {!collapsed && user && (
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${roleInfo.color}`}>
              <RoleIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
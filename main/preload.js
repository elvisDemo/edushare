/**
 * preload.js — contextBridge IPC API for EduShare
 * 
 * Exposes secure, typed IPC channels to the renderer process.
 * Renderer accesses via `window.edushareAPI`.
 * 
 * Security: contextBridge isolates renderer from Node.js modules.
 * All IPC calls include error handling.
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Wrapper for IPC calls with consistent error handling
 * @param {string} channel - IPC channel name
 * @param {...any} args - Arguments to pass to ipcRenderer.invoke
 * @returns {Promise<any>} - Resolves with response or rejects with error
 */
const invokeWithErrorHandling = (channel, ...args) => {
  return ipcRenderer.invoke(channel, ...args)
    .then(response => {
      if (response && response.success === false) {
        throw new Error(response.error || `IPC call ${channel} failed`);
      }
      return response;
    })
    .catch(error => {
      console.error(`[preload] IPC error on channel ${channel}:`, error);
      throw error;
    });
};

// Expose secure API to renderer
contextBridge.exposeInMainWorld('edushareAPI', {
  // ==================== AUTH ====================
  auth: {
    /**
     * Authenticate user with username and password
     * @param {Object} creds - Credentials {username, password}
     * @returns {Promise<{id: string, username: string, full_name: string, role: string}>}
     */
    login: (creds) => invokeWithErrorHandling('auth:login', creds),
    
    /**
     * Log out current user
     * @returns {Promise<void>}
     */
    logout: () => invokeWithErrorHandling('auth:logout'),
  },

  // ==================== INVENTORY ====================
  inventory: {
    /**
     * Get inventory items with optional filters
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Array>} - List of inventory items
     */
    getItems: (filters) => invokeWithErrorHandling('inventory:getItems', filters),
    
    /**
     * Get single inventory item by ID
     * @param {string} id - Item ID
     * @returns {Promise<Object>} - Item details
     */
    getItem: (id) => invokeWithErrorHandling('inventory:getItem', id),
    
    /**
     * Create new inventory item
     * @param {Object} data - Item data
     * @returns {Promise<{id: string}>} - Created item ID
     */
    createItem: (data) => invokeWithErrorHandling('inventory:createItem', data),
    
    /**
     * Update existing inventory item
     * @param {string} id - Item ID
     * @param {Object} data - Updated item data
     * @returns {Promise<void>}
     */
    updateItem: (id, data) => invokeWithErrorHandling('inventory:updateItem', id, data),
    
    /**
     * Delete inventory item (soft delete)
     * @param {string} id - Item ID
     * @returns {Promise<void>}
     */
    deleteItem: (id) => invokeWithErrorHandling('inventory:deleteItem', id),
    
    /**
     * Restore soft-deleted inventory item
     * @param {string} id - Item ID
     * @returns {Promise<void>}
     */
    restoreItem: (id) => invokeWithErrorHandling('inventory:restoreItem', id),
    
    /**
     * Get all categories
     * @returns {Promise<Array>} - List of categories
     */
    getCategories: () => invokeWithErrorHandling('inventory:getCategories'),
    
    /**
     * Create new category
     * @param {Object} data - Category data
     * @returns {Promise<{id: string}>} - Created category ID
     */
    createCategory: (data) => invokeWithErrorHandling('inventory:createCategory', data),
    
    /**
     * Update existing category
     * @param {string} id - Category ID
     * @param {Object} data - Updated category data
     * @returns {Promise<void>}
     */
    updateCategory: (id, data) => invokeWithErrorHandling('inventory:updateCategory', id, data),
    
    /**
     * Delete category (if no items reference it)
     * @param {string} id - Category ID
     * @returns {Promise<void>}
     */
    deleteCategory: (id) => invokeWithErrorHandling('inventory:deleteCategory', id),
    
    /**
     * Export inventory to CSV
     * @param {Object} filters - Filter criteria
     * @returns {Promise<string>} - CSV data
     */
    exportCSV: (filters) => invokeWithErrorHandling('inventory:exportCSV', filters),
  },

  // ==================== LOANS ====================
  loans: {
    /**
     * Create new loan
     * @param {Object} data - Loan data
     * @returns {Promise<{id: string}>} - Created loan ID
     */
    createLoan: (data) => invokeWithErrorHandling('loans:createLoan', data),
    
    /**
     * Get active loans
     * @returns {Promise<Array>} - List of active loans
     */
    getActiveLoans: () => invokeWithErrorHandling('loans:getActiveLoans'),
    
    /**
     * Get overdue loans
     * @returns {Promise<Array>} - List of overdue loans
     */
    getOverdueLoans: () => invokeWithErrorHandling('loans:getOverdueLoans'),
    
    /**
     * Get single loan by ID
     * @param {string} id - Loan ID
     * @returns {Promise<Object>} - Loan details
     */
    getLoan: (id) => invokeWithErrorHandling('loans:getLoan', id),
    
    /**
     * Return loaned item
     * @param {Object} data - Return data
     * @returns {Promise<void>}
     */
    returnItem: (data) => invokeWithErrorHandling('loans:returnItem', data),
    
    /**
     * Get loan history with filters
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Array>} - Loan history
     */
    getHistory: (filters) => invokeWithErrorHandling('loans:getHistory', filters),
    
    /**
     * Check for overdue loans and update status
     * @returns {Promise<number>} - Number of loans marked overdue
     */
    checkOverdue: () => invokeWithErrorHandling('loans:checkOverdue'),
    
    /**
     * Get count of overdue loans
     * @returns {Promise<number>} - Overdue count
     */
    getOverdueCount: () => invokeWithErrorHandling('loans:getOverdueCount'),
  },

  // ==================== REPORTS ====================
  reports: {
    /**
     * Generate report
     * @param {string} type - Report type
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} - Report data
     */
    generate: (type, filters) => invokeWithErrorHandling('reports:generate', type, filters),
    
    /**
     * Export report to PDF
     * @param {Object} data - Report data for PDF
     * @returns {Promise<string>} - PDF file path
     */
    exportPDF: (data) => invokeWithErrorHandling('reports:exportPDF', data),
  },

  // ==================== SETTINGS ====================
  settings: {
    /**
     * Get setting value by key
     * @param {string} key - Setting key
     * @returns {Promise<string>} - Setting value
     */
    get: (key) => invokeWithErrorHandling('settings:get', key),
    
    /**
     * Set setting value
     * @param {string} key - Setting key
     * @param {string} value - Setting value
     * @returns {Promise<void>}
     */
    set: (key, value) => invokeWithErrorHandling('settings:set', key, value),
    
    /**
     * Get all settings
     * @returns {Promise<Object>} - All settings
     */
    getAll: () => invokeWithErrorHandling('settings:getAll'),
    
    /**
     * Check if setup wizard is complete
     * @returns {Promise<boolean>} - True if setup complete
     */
    isSetupComplete: () => invokeWithErrorHandling('settings:isSetupComplete'),
  },

  // ==================== BACKUP ====================
  backup: {
    /**
     * Create backup
     * @param {Object} opts - Backup options
     * @returns {Promise<string>} - Backup file path
     */
    create: (opts) => invokeWithErrorHandling('backup:create', opts),
    
    /**
     * Restore from backup
     * @param {Object} opts - Restore options
     * @returns {Promise<void>}
     */
    restore: (opts) => invokeWithErrorHandling('backup:restore', opts),
  },

  // ==================== RECOVERY ====================
  recovery: {
    /**
     * Generate recovery file
     * @returns {Promise<string>} - Recovery file data (base64)
     */
    generate: () => invokeWithErrorHandling('recovery:generate'),
    
    /**
     * Reset system using recovery file
     * @param {Object} opts - Recovery options
     * @returns {Promise<void>}
     */
    reset: (opts) => invokeWithErrorHandling('recovery:reset', opts),
  },

  // ==================== USERS ====================
  users: {
    /**
     * Get all users
     * @returns {Promise<Array>} - List of users
     */
    getAll: () => invokeWithErrorHandling('users:getAll'),
    
    /**
     * Create new user
     * @param {Object} data - User data
     * @returns {Promise<{id: string}>} - Created user ID
     */
    create: (data) => invokeWithErrorHandling('users:create', data),
    
    /**
     * Update existing user
     * @param {string} id - User ID
     * @param {Object} data - Updated user data
     * @returns {Promise<void>}
     */
    update: (id, data) => invokeWithErrorHandling('users:update', id, data),
    
    /**
     * Deactivate user
     * @param {string} id - User ID
     * @returns {Promise<void>}
     */
    deactivate: (id) => invokeWithErrorHandling('users:deactivate', id),
    
    /**
     * Reset user password
     * @param {string} id - User ID
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    resetPassword: (id, newPassword) => invokeWithErrorHandling('users:resetPassword', id, newPassword),
  },
});

// TypeScript support: expose type declarations
if (process.env.NODE_ENV === 'development') {
  console.log('[preload] EduShare API exposed as window.edushareAPI');
}
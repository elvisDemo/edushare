/**
 * TypeScript definitions for EduShare IPC API
 * 
 * This file provides TypeScript support for `window.edushareAPI`
 * Used by IDEs for autocomplete and type checking
 */

declare global {
  interface Window {
    edushareAPI: typeof edushareAPI;
  }
}

// ==================== COMMON TYPES ====================

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'super_admin' | 'school_admin' | 'librarian' | 'lab_technician';
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface Item {
  id: string;
  name: string;
  category_id: string;
  quantity: number;
  available_count: number;
  condition: 'Good' | 'Fair' | 'Poor' | 'Damaged';
  serial_number?: string;
  asset_tag?: string;
  description?: string;
  owner_school?: string;
  location?: string;
  purchase_date?: string;
  cost?: number;
  image_path?: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  updated_at: string;
  updated_by?: string;
}

export interface Loan {
  id: string;
  item_id: string;
  borrower_type: 'Student' | 'Teacher' | 'Other School' | 'Other';
  borrower_description?: string;
  borrower_name: string;
  borrower_id_class?: string;
  borrower_contact?: string;
  quantity_loaned: number;
  date_borrowed: string;
  due_date: string;
  purpose?: string;
  notes?: string;
  status: 'active' | 'returned' | 'overdue';
  created_at: string;
  created_by?: string;
}

export interface Return {
  id: string;
  loan_id: string;
  date_returned: string;
  condition_on_return: 'Good' | 'Fair' | 'Poor' | 'Damaged';
  return_notes?: string;
  is_damaged: boolean;
  damage_reviewed: boolean;
  created_at: string;
  created_by?: string;
}

export interface ReportData {
  type: string;
  title: string;
  generated_at: string;
  data: any[];
  summary?: Record<string, any>;
}

export interface BackupOptions {
  password: string;
  destinationPath?: string;
}

export interface RestoreOptions {
  backupPath: string;
  password: string;
}

export interface RecoveryOptions {
  recoveryFile: string;
  password: string;
}

// ==================== API INTERFACE ====================

export const edushareAPI = {
  // ==================== AUTH ====================
  auth: {
    /**
     * Authenticate user with username and password
     */
    login: (creds: { username: string; password: string }): Promise<{
      success: boolean;
      data?: User;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Log out current user
     */
    logout: (): Promise<{ success: boolean; error?: string }> => 
      Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== INVENTORY ====================
  inventory: {
    /**
     * Get inventory items with optional filters
     */
    getItems: (filters?: {
      category_id?: string;
      condition?: string;
      location?: string;
      owner_school?: string;
      search?: string;
      is_active?: boolean;
    }): Promise<{
      success: boolean;
      data?: Item[];
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get single inventory item by ID
     */
    getItem: (id: string): Promise<{
      success: boolean;
      data?: Item;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Create new inventory item
     */
    createItem: (data: Omit<Item, 'id' | 'available_count' | 'created_at' | 'updated_at' | 'is_active'>): Promise<{
      success: boolean;
      data?: { id: string };
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Update existing inventory item
     */
    updateItem: (id: string, data: Partial<Omit<Item, 'id' | 'available_count' | 'created_at' | 'updated_at'>>): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Delete inventory item (soft delete)
     */
    deleteItem: (id: string): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Restore soft-deleted inventory item
     */
    restoreItem: (id: string): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get all categories
     */
    getCategories: (): Promise<{
      success: boolean;
      data?: Category[];
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Create new category
     */
    createCategory: (data: Omit<Category, 'id' | 'created_at' | 'is_active'>): Promise<{
      success: boolean;
      data?: { id: string };
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Update existing category
     */
    updateCategory: (id: string, data: Partial<Omit<Category, 'id' | 'created_at'>>): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Delete category (if no items reference it)
     */
    deleteCategory: (id: string): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Export inventory to CSV
     */
    exportCSV: (filters?: {
      category_id?: string;
      condition?: string;
      location?: string;
      owner_school?: string;
      search?: string;
    }): Promise<{
      success: boolean;
      data?: string;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== LOANS ====================
  loans: {
    /**
     * Create new loan
     */
    createLoan: (data: Omit<Loan, 'id' | 'status' | 'created_at'>): Promise<{
      success: boolean;
      data?: { id: string };
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get active loans
     */
    getActiveLoans: (): Promise<{
      success: boolean;
      data?: Loan[];
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get overdue loans
     */
    getOverdueLoans: (): Promise<{
      success: boolean;
      data?: Loan[];
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get single loan by ID
     */
    getLoan: (id: string): Promise<{
      success: boolean;
      data?: Loan;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Return loaned item
     */
    returnItem: (data: Omit<Return, 'id' | 'created_at'>): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get loan history with filters
     */
    getHistory: (filters?: {
      start_date?: string;
      end_date?: string;
      borrower_type?: string;
      item_id?: string;
      status?: string;
    }): Promise<{
      success: boolean;
      data?: Loan[];
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Check for overdue loans and update status
     */
    checkOverdue: (): Promise<{
      success: boolean;
      data?: { count: number };
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get count of overdue loans
     */
    getOverdueCount: (): Promise<{
      success: boolean;
      data?: { count: number };
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== REPORTS ====================
  reports: {
    /**
     * Generate report
     */
    generate: (type: string, filters?: Record<string, any>): Promise<{
      success: boolean;
      data?: ReportData;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Export report to PDF
     */
    exportPDF: (data: ReportData): Promise<{
      success: boolean;
      data?: string;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== SETTINGS ====================
  settings: {
    /**
     * Get setting value by key
     */
    get: (key: string): Promise<{
      success: boolean;
      data?: string;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Set setting value
     */
    set: (key: string, value: string): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Get all settings
     */
    getAll: (): Promise<{
      success: boolean;
      data?: Record<string, string>;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Check if setup wizard is complete
     */
    isSetupComplete: (): Promise<{
      success: boolean;
      data?: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== BACKUP ====================
  backup: {
    /**
     * Create backup
     */
    create: (opts: BackupOptions): Promise<{
      success: boolean;
      data?: string;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Restore from backup
     */
    restore: (opts: RestoreOptions): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== RECOVERY ====================
  recovery: {
    /**
     * Generate recovery file
     */
    generate: (): Promise<{
      success: boolean;
      data?: string;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Reset system using recovery file
     */
    reset: (opts: RecoveryOptions): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },

  // ==================== USERS ====================
  users: {
    /**
     * Get all users
     */
    getAll: (): Promise<{
      success: boolean;
      data?: User[];
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Create new user
     */
    create: (data: Omit<User, 'id' | 'created_at' | 'last_login' | 'is_active'> & { password: string }): Promise<{
      success: boolean;
      data?: { id: string };
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Update existing user
     */
    update: (id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'last_login'>>): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Deactivate user
     */
    deactivate: (id: string): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
    
    /**
     * Reset user password
     */
    resetPassword: (id: string, newPassword: string): Promise<{
      success: boolean;
      error?: string;
    }> => Promise.resolve({ success: false, error: 'Not implemented' }),
  },
};

export {};
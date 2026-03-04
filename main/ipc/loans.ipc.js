/**
 * loans.ipc.js — IPC handlers for loan management
 * 
 * Exposes:
 *   - loans:createLoan
 *   - loans:getActiveLoans
 *   - loans:getOverdueLoans
 *   - loans:returnItem
 *   - loans:getHistory
 * 
 * Critical: Loan creation checks available_count dynamically.
 * available_count = quantity - SUM(active/overdue loans)
 */

const { ipcMain } = require('electron');
const { getDatabase, auditLog } = require('../database/db');
const { getAvailableCount } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

/**
 * Check overdue loans and update status
 * Should be called on app launch
 */
function checkOverdueLoans() {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  const result = db.prepare(`
    UPDATE loans 
    SET status = 'overdue'
    WHERE status = 'active' AND due_date < ?
  `).run(today);
  
  if (result.changes > 0) {
    console.log(`[loans] Marked ${result.changes} loans as overdue`);
  }
  
  return result.changes;
}

// Note: checkOverdueLoans() should be called from main process after database initialization
// during app startup, not when this module loads.

// ──────────────────────────────────────────────────────────────
// IPC Handlers
// ──────────────────────────────────────────────────────────────

/**
 * Create a new loan
 * CRITICAL: Checks available_count before allowing loan
 */
ipcMain.handle('loans:createLoan', async (event, data) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    // 1. Check item exists and is active
    const item = db.prepare(`
      SELECT id, name, quantity FROM items 
      WHERE id = ? AND is_active = 1
    `).get(data.item_id);
    
    if (!item) {
      return { success: false, error: 'Item not found or inactive' };
    }
    
    // 2. Calculate available_count dynamically
    const availableCount = getAvailableCount(db, data.item_id);
    
    // 3. Validate quantity
    if (data.quantity_loaned <= 0) {
      return { success: false, error: 'Loan quantity must be positive' };
    }
    
    if (data.quantity_loaned > availableCount) {
      return { 
        success: false, 
        error: `Cannot loan ${data.quantity_loaned} items. Only ${availableCount} available.` 
      };
    }
    
    // 4. Validate dates
    const dateBorrowed = data.date_borrowed || new Date().toISOString().split('T')[0];
    const dueDate = data.due_date;
    
    if (!dueDate) {
      return { success: false, error: 'Due date is required' };
    }
    
    if (dueDate < dateBorrowed) {
      return { success: false, error: 'Due date cannot be before borrow date' };
    }
    
    // 5. Create loan
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO loans (
        id, item_id, borrower_type, borrower_description,
        borrower_name, borrower_id_class, borrower_contact,
        quantity_loaned, date_borrowed, due_date,
        purpose, notes, status, created_at, created_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      id,
      data.item_id,
      data.borrower_type,
      data.borrower_description || null,
      data.borrower_name,
      data.borrower_id_class || null,
      data.borrower_contact || null,
      data.quantity_loaned,
      dateBorrowed,
      dueDate,
      data.purpose || null,
      data.notes || null,
      'active',
      now,
      performedBy
    );
    
    // 6. Recalculate available_count for response
    const newAvailableCount = getAvailableCount(db, data.item_id);
    
    auditLog('INSERT', 'loans', id, null, data, performedBy);
    
    return { 
      success: true, 
      data: { 
        id,
        ...data,
        status: 'active',
        created_at: now,
        item_name: item.name,
        available_count_before: availableCount,
        available_count_after: newAvailableCount
      } 
    };
  } catch (err) {
    console.error('[loans:createLoan]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Get all active loans (including overdue)
 * Includes item details and calculated available_count
 */
ipcMain.handle('loans:getActiveLoans', async (event) => {
  try {
    const db = getDatabase();
    
    const loans = db.prepare(`
      SELECT 
        l.*,
        i.name as item_name,
        i.serial_number,
        i.asset_tag,
        i.condition as item_condition,
        c.name as category_name,
        (i.quantity - (
          SELECT COALESCE(SUM(quantity_loaned), 0)
          FROM loans l2
          WHERE l2.item_id = i.id AND l2.status IN ('active', 'overdue')
        )) as available_count
      FROM loans l
      JOIN items i ON l.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE l.status IN ('active', 'overdue')
      ORDER BY l.due_date
    `).all();
    
    return { success: true, data: loans };
  } catch (err) {
    console.error('[loans:getActiveLoans]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Get overdue loans only
 */
ipcMain.handle('loans:getOverdueLoans', async (event) => {
  try {
    const db = getDatabase();
    
    const loans = db.prepare(`
      SELECT 
        l.*,
        i.name as item_name,
        i.serial_number,
        i.asset_tag,
        i.condition as item_condition,
        c.name as category_name
      FROM loans l
      JOIN items i ON l.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE l.status = 'overdue'
      ORDER BY l.due_date
    `).all();
    
    return { success: true, data: loans };
  } catch (err) {
    console.error('[loans:getOverdueLoans]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Return a loaned item
 */
ipcMain.handle('loans:returnItem', async (event, data) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    // 1. Get loan details
    const loan = db.prepare(`
      SELECT l.*, i.name as item_name 
      FROM loans l
      JOIN items i ON l.item_id = i.id
      WHERE l.id = ? AND l.status IN ('active', 'overdue')
    `).get(data.loan_id);
    
    if (!loan) {
      return { success: false, error: 'Loan not found or already returned' };
    }
    
    // 2. Create return record
    const returnId = uuidv4();
    const now = new Date().toISOString();
    const dateReturned = data.date_returned || new Date().toISOString().split('T')[0];
    
    db.transaction(() => {
      // Update loan status
      db.prepare(`
        UPDATE loans 
        SET status = 'returned'
        WHERE id = ?
      `).run(data.loan_id);
      
      // Create return record
      db.prepare(`
        INSERT INTO returns (
          id, loan_id, date_returned, condition_on_return,
          return_notes, is_damaged, damage_reviewed,
          created_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        returnId,
        data.loan_id,
        dateReturned,
        data.condition_on_return || null,
        data.return_notes || null,
        data.is_damaged ? 1 : 0,
        data.damage_reviewed ? 1 : 0,
        now,
        performedBy
      );
    })();
    
    // 3. Recalculate available_count for response
    const newAvailableCount = getAvailableCount(db, loan.item_id);
    
    auditLog('UPDATE', 'loans', data.loan_id, loan, { status: 'returned' }, performedBy);
    auditLog('INSERT', 'returns', returnId, null, data, performedBy);
    
    return { 
      success: true, 
      data: { 
        return_id: returnId,
        loan_id: data.loan_id,
        item_id: loan.item_id,
        item_name: loan.item_name,
        available_count_after: newAvailableCount,
        date_returned: dateReturned
      } 
    };
  } catch (err) {
    console.error('[loans:returnItem]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Get loan history with filters
 */
ipcMain.handle('loans:getHistory', async (event, filters = {}) => {
  try {
    const db = getDatabase();
    const { 
      itemId, borrowerType, status, 
      startDate, endDate, search 
    } = filters;
    
    let whereClauses = ['1=1'];
    const params = [];
    
    if (itemId) {
      whereClauses.push('l.item_id = ?');
      params.push(itemId);
    }
    
    if (borrowerType) {
      whereClauses.push('l.borrower_type = ?');
      params.push(borrowerType);
    }
    
    if (status) {
      whereClauses.push('l.status = ?');
      params.push(status);
    }
    
    if (startDate) {
      whereClauses.push('l.date_borrowed >= ?');
      params.push(startDate);
    }
    
    if (endDate) {
      whereClauses.push('l.date_borrowed <= ?');
      params.push(endDate);
    }
    
    if (search) {
      whereClauses.push('(l.borrower_name LIKE ? OR i.name LIKE ? OR l.borrower_id_class LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const where = whereClauses.join(' AND ');
    
    const loans = db.prepare(`
      SELECT 
        l.*,
        i.name as item_name,
        i.serial_number,
        i.asset_tag,
        i.condition as item_condition,
        c.name as category_name,
        r.date_returned,
        r.condition_on_return,
        r.return_notes,
        r.is_damaged,
        r.damage_reviewed
      FROM loans l
      JOIN items i ON l.item_id = i.id
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN returns r ON l.id = r.loan_id
      WHERE ${where}
      ORDER BY l.date_borrowed DESC
    `).all(...params);
    
    return { success: true, data: loans };
  } catch (err) {
    console.error('[loans:getHistory]', err);
    return { success: false, error: err.message };
  }
});

console.log('[ipc] Loans IPC handlers registered');
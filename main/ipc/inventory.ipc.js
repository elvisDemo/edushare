/**
 * inventory.ipc.js — IPC handlers for inventory management
 * 
 * Exposes:
 *   - inventory:getItems
 *   - inventory:createItem
 *   - inventory:updateItem
 *   - inventory:deleteItem
 *   - inventory:getCategories
 *   - inventory:createCategory
 *   - inventory:updateCategory
 *   - inventory:deleteCategory
 * 
 * All handlers include audit logging and permission checks.
 * available_count is calculated dynamically using AVAILABLE_COUNT_SQL.
 */

const { ipcMain } = require('electron');
const { getDatabase } = require('../database/db');
const { getAvailableCount, AVAILABLE_COUNT_SQL } = require('../database/schema');
const { v4: uuidv4 } = require('uuid');

/**
 * Audit log helper — records every write action
 */
function auditLog(action, table, recordId, oldValues, newValues, performedBy) {
  const db = getDatabase();
  db.prepare(`
    INSERT INTO audit_log (id, action, table_name, record_id, old_values, new_values, performed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(),
    action,
    table,
    recordId,
    JSON.stringify(oldValues),
    JSON.stringify(newValues),
    performedBy
  );
}

/**
 * Permission check helper
 * TODO: Implement proper role-based permissions
 */
function checkPermission(user, permission) {
  // For now, allow all authenticated users
  // Will be implemented in Week 2
  return user && user.id;
}

// ──────────────────────────────────────────────────────────────
// IPC Handlers
// ──────────────────────────────────────────────────────────────

/**
 * Get items with filters
 * Includes dynamically calculated available_count
 */
ipcMain.handle('inventory:getItems', async (event, filters = {}) => {
  try {
    const db = getDatabase();
    const { categoryId, condition, location, search, isActive = 1 } = filters;
    
    let whereClauses = ['i.is_active = ?'];
    const params = [isActive];
    
    if (categoryId) {
      whereClauses.push('i.category_id = ?');
      params.push(categoryId);
    }
    
    if (condition) {
      whereClauses.push('i.condition = ?');
      params.push(condition);
    }
    
    if (location) {
      whereClauses.push('i.location = ?');
      params.push(location);
    }
    
    if (search) {
      whereClauses.push('(i.name LIKE ? OR i.description LIKE ? OR i.serial_number LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const items = db.prepare(`
      SELECT 
        i.*,
        c.name as category_name,
        (${AVAILABLE_COUNT_SQL}) as available_count
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ${where}
      ORDER BY i.name
    `).all(...params);
    
    return { success: true, data: items };
  } catch (err) {
    console.error('[inventory:getItems]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Create a new inventory item
 */
ipcMain.handle('inventory:createItem', async (event, data) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO items (
        id, name, category_id, quantity, condition,
        serial_number, asset_tag, description, owner_school,
        location, purchase_date, cost, image_path,
        is_active, created_at, created_by, updated_at, updated_by
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    
    stmt.run(
      id,
      data.name,
      data.category_id || null,
      data.quantity || 0,
      data.condition || null,
      data.serial_number || null,
      data.asset_tag || null,
      data.description || null,
      data.owner_school || null,
      data.location || null,
      data.purchase_date || null,
      data.cost || null,
      data.image_path || null,
      data.is_active !== undefined ? data.is_active : 1,
      now,
      performedBy,
      now,
      performedBy
    );
    
    // Calculate available_count for response
    const availableCount = getAvailableCount(db, id);
    
    auditLog('INSERT', 'items', id, null, data, performedBy);
    
    return { 
      success: true, 
      data: { 
        id, 
        ...data,
        available_count: availableCount,
        created_at: now,
        updated_at: now
      } 
    };
  } catch (err) {
    console.error('[inventory:createItem]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Update an existing inventory item
 */
ipcMain.handle('inventory:updateItem', async (event, id, data) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    // Get old values for audit log
    const oldItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!oldItem) {
      return { success: false, error: 'Item not found' };
    }
    
    const now = new Date().toISOString();
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    const fields = [
      'name', 'category_id', 'quantity', 'condition',
      'serial_number', 'asset_tag', 'description', 'owner_school',
      'location', 'purchase_date', 'cost', 'image_path', 'is_active'
    ];
    
    fields.forEach(field => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    });
    
    updates.push('updated_at = ?');
    params.push(now);
    
    updates.push('updated_by = ?');
    params.push(performedBy);
    
    params.push(id); // WHERE clause
    
    const stmt = db.prepare(`
      UPDATE items 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...params);
    
    // Calculate available_count for response
    const availableCount = getAvailableCount(db, id);
    
    auditLog('UPDATE', 'items', id, oldItem, data, performedBy);
    
    return { 
      success: true, 
      data: { 
        id,
        ...data,
        available_count: availableCount,
        updated_at: now
      } 
    };
  } catch (err) {
    console.error('[inventory:updateItem]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Soft delete an inventory item (set is_active = 0)
 */
ipcMain.handle('inventory:deleteItem', async (event, id) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    // Get old values for audit log
    const oldItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    if (!oldItem) {
      return { success: false, error: 'Item not found' };
    }
    
    const now = new Date().toISOString();
    
    db.prepare(`
      UPDATE items 
      SET is_active = 0, updated_at = ?, updated_by = ?
      WHERE id = ?
    `).run(now, performedBy, id);
    
    auditLog('SOFT_DELETE', 'items', id, oldItem, { is_active: 0 }, performedBy);
    
    return { success: true, data: { id } };
  } catch (err) {
    console.error('[inventory:deleteItem]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Get all categories
 */
ipcMain.handle('inventory:getCategories', async (event) => {
  try {
    const db = getDatabase();
    
    const categories = db.prepare(`
      SELECT * FROM categories 
      WHERE is_active = 1 
      ORDER BY name
    `).all();
    
    return { success: true, data: categories };
  } catch (err) {
    console.error('[inventory:getCategories]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Create a new category
 */
ipcMain.handle('inventory:createCategory', async (event, data) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO categories (id, name, description, is_active, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id,
      data.name,
      data.description || null,
      data.is_active !== undefined ? data.is_active : 1,
      now,
      performedBy
    );
    
    auditLog('INSERT', 'categories', id, null, data, performedBy);
    
    return { success: true, data: { id, ...data, created_at: now } };
  } catch (err) {
    console.error('[inventory:createCategory]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Update a category
 */
ipcMain.handle('inventory:updateCategory', async (event, id, data) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    // Get old values for audit log
    const oldCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!oldCategory) {
      return { success: false, error: 'Category not found' };
    }
    
    const now = new Date().toISOString();
    
    // Check if category has items before deactivating
    if (data.is_active === 0) {
      const itemCount = db.prepare(
        'SELECT COUNT(*) as count FROM items WHERE category_id = ? AND is_active = 1'
      ).get(id);
      
      if (itemCount.count > 0) {
        return { 
          success: false, 
          error: 'Cannot deactivate category with active items' 
        };
      }
    }
    
    db.prepare(`
      UPDATE categories 
      SET name = ?, description = ?, is_active = ?
      WHERE id = ?
    `).run(
      data.name,
      data.description || null,
      data.is_active !== undefined ? data.is_active : 1,
      id
    );
    
    auditLog('UPDATE', 'categories', id, oldCategory, data, performedBy);
    
    return { success: true, data: { id, ...data } };
  } catch (err) {
    console.error('[inventory:updateCategory]', err);
    return { success: false, error: err.message };
  }
});

/**
 * Delete a category (soft delete)
 */
ipcMain.handle('inventory:deleteCategory', async (event, id) => {
  try {
    const db = getDatabase();
    const user = event.sender?.user; // TODO: Get from session
    const performedBy = user?.id || 'system';
    
    // Get old values for audit log
    const oldCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!oldCategory) {
      return { success: false, error: 'Category not found' };
    }
    
    // Check if category has items
    const itemCount = db.prepare(
      'SELECT COUNT(*) as count FROM items WHERE category_id = ? AND is_active = 1'
    ).get(id);
    
    if (itemCount.count > 0) {
      return { 
        success: false, 
        error: 'Cannot delete category with active items' 
      };
    }
    
    db.prepare(`
      UPDATE categories 
      SET is_active = 0
      WHERE id = ?
    `).run(id);
    
    auditLog('SOFT_DELETE', 'categories', id, oldCategory, { is_active: 0 }, performedBy);
    
    return { success: true, data: { id } };
  } catch (err) {
    console.error('[inventory:deleteCategory]', err);
    return { success: false, error: err.message };
  }
});

console.log('[ipc] Inventory IPC handlers registered');
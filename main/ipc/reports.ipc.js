const { ipcMain } = require('electron');
const { getDatabase } = require('../database/db');

const registerReportsHandlers = () => {
  ipcMain.handle('reports:generate', async (event, type, filters = {}) => {
    try {
      const db = getDatabase();
      let data;

      switch (type) {
        case 'inventory_summary':
          data = db.prepare(`
            SELECT i.*, c.name as category_name FROM items i
            LEFT JOIN categories c ON i.category_id = c.id
            WHERE i.is_active = 1 ORDER BY c.name, i.name
          `).all();
          break;
        case 'active_loans':
          data = db.prepare(`
            SELECT l.*, i.name as item_name FROM loans l
            JOIN items i ON l.item_id = i.id
            WHERE l.status IN ('active','overdue') ORDER BY l.due_date
          `).all();
          break;
        case 'overdue_loans':
          data = db.prepare(`
            SELECT l.*, i.name as item_name FROM loans l
            JOIN items i ON l.item_id = i.id
            WHERE l.status = 'overdue' ORDER BY l.due_date
          `).all();
          break;
        case 'items_by_category':
          data = db.prepare(`
            SELECT c.name as category, COUNT(i.id) as item_count, SUM(i.quantity) as total_quantity
            FROM categories c LEFT JOIN items i ON c.id = i.category_id AND i.is_active = 1
            WHERE c.is_active = 1 GROUP BY c.id ORDER BY c.name
          `).all();
          break;
        case 'loan_history':
          data = db.prepare(`
            SELECT l.*, i.name as item_name FROM loans l
            JOIN items i ON l.item_id = i.id
            ORDER BY l.date_borrowed DESC
          `).all();
          break;
        default:
          return { success: false, error: 'Unknown report type' };
      }

      return { success: true, data };
    } catch (err) {
      console.error('[reports:generate]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('reports:exportPDF', async (event, data) => {
    try {
      // PDF export is handled in renderer via jsPDF
      // Main process handles file save dialog
      const { dialog } = require('electron');
      const fs = require('fs');

      const result = await dialog.showSaveDialog({
        title: 'Save Report',
        defaultPath: `EduShare_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      });

      if (result.canceled) return { success: false, error: 'Cancelled' };

      fs.writeFileSync(result.filePath, Buffer.from(data.buffer));
      return { success: true, filePath: result.filePath };
    } catch (err) {
      console.error('[reports:exportPDF]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerReportsHandlers };

const { ipcMain } = require('electron');
const { getDatabase, auditLog } = require('../database/db');
const { getCurrentUser } = require('./auth.ipc');

const registerSettingsHandlers = () => {
  ipcMain.handle('settings:get', async (event, key) => {
    try {
      const row = getDatabase().prepare('SELECT value FROM settings WHERE key = ?').get(key);
      return { success: true, data: row ? row.value : null };
    } catch (err) {
      console.error('[settings:get]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:set', async (event, key, value) => {
    try {
      const user = getCurrentUser();
      const db = getDatabase();
      const existing = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);

      db.prepare(`
        INSERT INTO settings (key, value, updated_by) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP, updated_by = excluded.updated_by
      `).run(key, value, user?.username || 'system');

      auditLog('UPSERT', 'settings', key, existing ? { value: existing.value } : null, { value }, user?.username || 'system');
      return { success: true };
    } catch (err) {
      console.error('[settings:set]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:getAll', async () => {
    try {
      const rows = getDatabase().prepare('SELECT key, value FROM settings').all();
      const settings = {};
      rows.forEach(r => { settings[r.key] = r.value; });
      return { success: true, data: settings };
    } catch (err) {
      console.error('[settings:getAll]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('settings:isSetupComplete', async () => {
    try {
      const row = getDatabase().prepare("SELECT value FROM settings WHERE key = 'setup_complete'").get();
      return { success: true, data: row?.value === 'true' };
    } catch (err) {
      console.error('[settings:isSetupComplete]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerSettingsHandlers };

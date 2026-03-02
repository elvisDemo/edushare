const { ipcMain } = require('electron');
const { getDb, auditLog } = require('../database/db');
const { getCurrentUser } = require('./auth.ipc');
const { v4: uuidv4 } = require('uuid');

// Role permissions check
const can = (user, permission) => {
  if (!user) return false;
  const PERMISSIONS = {
    super_admin: ['*'],
    school_admin: ['inventory.*','loans.*','returns.*','reports.*','users.*','settings.*','backup.*'],
    librarian: ['inventory.*','loans.*','returns.*','reports.read'],
    lab_technician: ['inventory.*','loans.*','returns.*','reports.read'],
  };
  const perms = PERMISSIONS[user.role] || [];
  if (perms.includes('*')) return true;
  const [ns] = permission.split('.');
  return perms.includes(permission) || perms.includes(`${ns}.*`);
};

const registerUsersHandlers = () => {
  ipcMain.handle('users:getAll', async () => {
    try {
      const user = getCurrentUser();
      if (!can(user, 'users.*')) return { success: false, error: 'Unauthorized' };
      // Never return password_hash
      const users = getDb().prepare(
        'SELECT id, username, full_name, role, is_active, created_at, last_login FROM users ORDER BY full_name'
      ).all();
      return { success: true, data: users };
    } catch (err) {
      console.error('[users:getAll]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('users:create', async (event, data) => {
    try {
      const bcrypt = require('bcrypt');
      const id = uuidv4();
      const hash = await bcrypt.hash(data.password, 12);
      const caller = getCurrentUser();
      getDb().prepare(`
        INSERT INTO users (id, username, password_hash, full_name, role, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, data.username, hash, data.full_name, data.role, caller?.username || 'setup');
      auditLog('INSERT', 'users', id, null, { username: data.username, role: data.role }, caller?.username || 'setup');
      return { success: true, data: { id } };
    } catch (err) {
      console.error('[users:create]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('users:update', async (event, id, data) => {
    try {
      const user = getCurrentUser();
      if (!can(user, 'users.*')) return { success: false, error: 'Unauthorized' };
      const old = getDb().prepare('SELECT id, username, full_name, role FROM users WHERE id = ?').get(id);
      getDb().prepare('UPDATE users SET full_name = ?, role = ? WHERE id = ?').run(data.full_name, data.role, id);
      auditLog('UPDATE', 'users', id, old, data, user?.username);
      return { success: true };
    } catch (err) {
      console.error('[users:update]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('users:deactivate', async (event, id) => {
    try {
      const user = getCurrentUser();
      if (!can(user, 'users.*')) return { success: false, error: 'Unauthorized' };
      if (user.id === id) return { success: false, error: 'Cannot deactivate yourself' };
      getDb().prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id);
      auditLog('DEACTIVATE', 'users', id, null, { is_active: 0 }, user?.username);
      return { success: true };
    } catch (err) {
      console.error('[users:deactivate]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('users:resetPassword', async (event, id, newPassword) => {
    try {
      const user = getCurrentUser();
      if (!can(user, 'users.*')) return { success: false, error: 'Unauthorized' };
      const bcrypt = require('bcrypt');
      const hash = await bcrypt.hash(newPassword, 12);
      getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, id);
      auditLog('RESET_PASSWORD', 'users', id, null, { note: 'password reset by admin' }, user?.username);
      return { success: true };
    } catch (err) {
      console.error('[users:resetPassword]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerUsersHandlers, can };

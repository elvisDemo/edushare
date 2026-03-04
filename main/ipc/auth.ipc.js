const { ipcMain } = require('electron');
const { getDatabase, auditLog } = require('../database/db');

// In-memory session store (cleared on app exit)
let currentUser = null;

const getCurrentUser = () => currentUser;

const registerAuthHandlers = () => {
  ipcMain.handle('auth:login', async (event, { username, password }) => {
    try {
      const bcrypt = require('bcrypt');
      const db = getDatabase();

      const user = db.prepare(
        'SELECT * FROM users WHERE username = ? AND is_active = 1'
      ).get(username);

      if (!user) {
        return { success: false, error: 'Invalid username or password' };
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Update last_login
      db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

      // Set session
      currentUser = {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      };

      auditLog('LOGIN', 'users', user.id, null, { username: user.username }, user.username);

      // Never return password_hash
      return {
        success: true,
        data: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
      };
    } catch (err) {
      console.error('[auth:login]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    try {
      if (currentUser) {
        auditLog('LOGOUT', 'users', currentUser.id, null, null, currentUser.username);
        currentUser = null;
      }
      return { success: true };
    } catch (err) {
      console.error('[auth:logout]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('auth:changePassword', async (event, { currentPassword, newPassword }) => {
    try {
      if (!currentUser) return { success: false, error: 'Not authenticated' };
      const bcrypt = require('bcrypt');
      const db = getDatabase();

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUser.id);
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) return { success: false, error: 'Current password is incorrect' };

      const hash = await bcrypt.hash(newPassword, 12);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, currentUser.id);
      auditLog('UPDATE', 'users', currentUser.id, null, { field: 'password' }, currentUser.username);

      return { success: true };
    } catch (err) {
      console.error('[auth:changePassword]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerAuthHandlers, getCurrentUser };

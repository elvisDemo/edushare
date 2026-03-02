const { ipcMain } = require('electron');
const { getDb, auditLog } = require('../database/db');
const crypto = require('crypto');
const fs = require('fs');

const getInstallationId = () => {
  const db = getDb();
  let row = db.prepare("SELECT value FROM settings WHERE key = 'installation_id'").get();
  if (!row) {
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO settings (key, value) VALUES ('installation_id', ?)").run(id);
    return id;
  }
  return row.value;
};

const registerRecoveryHandlers = () => {
  ipcMain.handle('recovery:generate', async () => {
    try {
      const { dialog } = require('electron');
      const db = getDb();
      const installId = getInstallationId();
      const token = crypto.randomBytes(32).toString('hex');
      const sig = crypto.createHmac('sha256', installId).update(token).digest('hex');
      const payload = {
        version: 1,
        installationId: installId,
        token,
        sig,
        createdAt: new Date().toISOString(),
      };
      const fileContent = Buffer.from(JSON.stringify(payload)).toString('base64');

      // Store token hash in settings (invalidated after use)
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      db.prepare("INSERT INTO settings (key, value) VALUES ('recovery_token_hash', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(tokenHash);

      const result = await dialog.showSaveDialog({
        title: 'Save Recovery File (save to USB)',
        defaultPath: 'EduShare_Recovery.esr',
        filters: [{ name: 'EduShare Recovery', extensions: ['esr'] }],
      });

      if (result.canceled) return { success: false, error: 'Cancelled' };
      fs.writeFileSync(result.filePath, fileContent);
      return { success: true, filePath: result.filePath };
    } catch (err) {
      console.error('[recovery:generate]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('recovery:reset', async (event, { recoveryFilePath, newPassword }) => {
    try {
      const { v4: uuidv4 } = require('uuid');
      const bcrypt = require('bcrypt');
      const db = getDb();
      const installId = getInstallationId();

      const fileContent = fs.readFileSync(recoveryFilePath, 'utf8');
      const payload = JSON.parse(Buffer.from(fileContent, 'base64').toString('utf8'));

      if (payload.installationId !== installId) {
        return { success: false, error: 'Recovery file is not for this installation' };
      }

      const expectedSig = crypto.createHmac('sha256', installId).update(payload.token).digest('hex');
      if (expectedSig !== payload.sig) {
        return { success: false, error: 'Recovery file signature invalid' };
      }

      const storedHash = db.prepare("SELECT value FROM settings WHERE key = 'recovery_token_hash'").get();
      if (!storedHash) return { success: false, error: 'No recovery token registered' };

      const tokenHash = crypto.createHash('sha256').update(payload.token).digest('hex');
      if (tokenHash !== storedHash.value) {
        return { success: false, error: 'Recovery token already used or invalid' };
      }

      // Reset Super Admin password
      const hash = await bcrypt.hash(newPassword, 12);
      const superAdmin = db.prepare("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1").get();
      if (!superAdmin) return { success: false, error: 'No Super Admin found' };

      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, superAdmin.id);

      // Invalidate token — generate a new hash that won't match
      db.prepare("UPDATE settings SET value = 'USED' WHERE key = 'recovery_token_hash'").run();

      auditLog('RECOVERY_RESET', 'users', superAdmin.id, null, { note: 'password reset via recovery file' }, 'recovery');
      return { success: true };
    } catch (err) {
      console.error('[recovery:reset]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerRecoveryHandlers };

const { ipcMain } = require('electron');
const { DB_PATH } = require('../database/db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const encryptBackup = (dbPath, password) => {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = fs.readFileSync(dbPath);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: salt(16) + iv(12) + tag(16) + data
  return Buffer.concat([salt, iv, tag, encrypted]);
};

const decryptBackup = (buf, password) => {
  const salt = buf.slice(0, 16);
  const iv = buf.slice(16, 28);
  const tag = buf.slice(28, 44);
  const data = buf.slice(44);
  const key = crypto.scryptSync(password, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(data), decipher.final()]);
  } catch {
    throw new Error('Incorrect password — cannot decrypt backup');
  }
};

const registerBackupHandlers = () => {
  ipcMain.handle('backup:create', async (event, { password }) => {
    try {
      const { dialog } = require('electron');
      const result = await dialog.showSaveDialog({
        title: 'Save Backup',
        defaultPath: `EduShare_Backup_${new Date().toISOString().split('T')[0]}.esbak`,
        filters: [{ name: 'EduShare Backup', extensions: ['esbak'] }],
      });

      if (result.canceled) return { success: false, error: 'Cancelled' };

      const encrypted = encryptBackup(DB_PATH, password);
      fs.writeFileSync(result.filePath, encrypted);
      return { success: true, filePath: result.filePath };
    } catch (err) {
      console.error('[backup:create]', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('backup:restore', async (event, { password }) => {
    try {
      const { dialog } = require('electron');
      const open = await dialog.showOpenDialog({
        title: 'Select Backup File',
        filters: [{ name: 'EduShare Backup', extensions: ['esbak'] }],
        properties: ['openFile'],
      });

      if (open.canceled || !open.filePaths.length) return { success: false, error: 'Cancelled' };

      const encrypted = fs.readFileSync(open.filePaths[0]);
      const decrypted = decryptBackup(encrypted, password);
      fs.writeFileSync(DB_PATH, decrypted);
      return { success: true };
    } catch (err) {
      console.error('[backup:restore]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerBackupHandlers };

const { ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const registerUtilsHandlers = () => {
  /**
   * Verify that a file exists and is accessible
   */
  ipcMain.handle('utils:verifyFile', async (event, filePath) => {
    try {
      if (!filePath || typeof filePath !== 'string') {
        return { success: false, error: 'Invalid file path' };
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'File does not exist' };
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      
      // Check if it's a file (not a directory)
      if (!stats.isFile()) {
        return { success: false, error: 'Path is not a file' };
      }

      // Check file size
      if (stats.size === 0) {
        return { success: false, error: 'File is empty' };
      }

      // Try to read the file to verify accessibility
      try {
        fs.accessSync(filePath, fs.constants.R_OK);
      } catch (accessError) {
        return { success: false, error: 'File is not readable' };
      }

      return { 
        success: true, 
        data: {
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString(),
          readable: true
        }
      };
    } catch (err) {
      console.error('[utils:verifyFile]', err);
      return { success: false, error: err.message };
    }
  });

  /**
   * Read a file as base64
   */
  ipcMain.handle('utils:readFileAsBase64', async (event, filePath) => {
    try {
      if (!filePath || typeof filePath !== 'string') {
        return { success: false, error: 'Invalid file path' };
      }

      // Verify file exists first
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'File does not exist' };
      }

      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        return { success: false, error: 'Path is not a file' };
      }

      // Read file as buffer and convert to base64
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');

      return { 
        success: true, 
        data: base64,
        size: buffer.length
      };
    } catch (err) {
      console.error('[utils:readFileAsBase64]', err);
      return { success: false, error: err.message };
    }
  });
};

module.exports = { registerUtilsHandlers };
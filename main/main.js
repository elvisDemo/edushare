/**
 * main.js — Electron entry point
 * Creates the browser window, initialises the database,
 * registers IPC handlers.
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { initDatabase, closeDatabase } = require('./database/db');

// Import IPC handler registration functions
const { registerAuthHandlers } = require('./ipc/auth.ipc');
const { registerReportsHandlers } = require('./ipc/reports.ipc');
const { registerBackupHandlers } = require('./ipc/backup.ipc');
const { registerRecoveryHandlers } = require('./ipc/recovery.ipc');
const { registerSettingsHandlers } = require('./ipc/settings.ipc');
const { registerUsersHandlers } = require('./ipc/users.ipc');

// Inventory and loans IPC handlers register immediately when required
require('./ipc/inventory.ipc');
require('./ipc/loans.ipc');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false,
    titleBarStyle: 'default',
    title: 'EduShare'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'dist', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Initialize database — must happen after app is ready
  try {
    initDatabase();
  } catch (err) {
    console.error('[main] Database initialization failed:', err);
    app.quit();
    return;
  }

  // Register all IPC handlers
  registerAuthHandlers();
  registerReportsHandlers();
  registerBackupHandlers();
  registerRecoveryHandlers();
  registerSettingsHandlers();
  registerUsersHandlers();
  // Inventory and loans handlers are registered automatically when required above

  console.log('[main] All IPC handlers registered');

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  closeDatabase();
});
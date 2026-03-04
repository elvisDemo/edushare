/**
 * db.js — SQLite database connection
 * 
 * Database path: app.getPath('userData') + edushare.db
 * Resolves to: C:\Users\[user]\AppData\Roaming\EduShare\edushare.db
 * 
 * NEVER use a hardcoded path or store in Program Files.
 * This path is always writable without admin rights.
 */

const path = require('path');
const Database = require('better-sqlite3');
const { app } = require('electron');
const { runMigrations } = require('./schema');

let db = null;
let DB_PATH = null;

/**
 * Initialize the database connection.
 * Must be called after Electron's 'app ready' event.
 * @returns {Database} The connected database instance
 */
function initDatabase() {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'edushare.db');
  DB_PATH = dbPath;

  console.log('[db] userData path:', userDataPath);
  console.log('[db] database path:', dbPath);

  try {
    db = new Database(dbPath, {
      // verbose: console.log  // Uncomment for SQL query logging in development
    });

    // Enable WAL mode for better performance and concurrency
    db.pragma('journal_mode = WAL');

    // Enable foreign key constraints
    db.pragma('foreign_keys = ON');

    // Run all table migrations
    runMigrations(db);

    console.log('[db] Connected successfully. Tables initialized.');
    return db;
  } catch (err) {
    console.error('[db] Failed to connect:', err);
    throw err;
  }
}

/**
 * Get the current database instance.
 * Throws if initDatabase() has not been called yet.
 * @returns {Database}
 */
function getDatabase() {
  if (!db) {
    throw new Error('[db] Database not initialized. Call initDatabase() first.');
  }
  return db;
}

// Alias for backward compatibility with existing IPC files
const getDb = getDatabase;

/**
 * Audit log helper — records every write action
 * Centralized to avoid duplication across IPC files
 */
function auditLog(action, table, recordId, oldValues, newValues, performedBy) {
  if (!db) {
    console.error('[auditLog] Database not initialized');
    return;
  }
  
  const { v4: uuidv4 } = require('uuid');
  try {
    db.prepare(`
      INSERT INTO audit_log (id, action, table_name, record_id, old_values, new_values, performed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      action,
      table,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      performedBy || 'system'
    );
  } catch (err) {
    console.error('[auditLog] Failed to log:', err);
  }
}

/**
 * Close the database connection gracefully.
 * Should be called on app 'before-quit'.
 */
function closeDatabase() {
  if (db) {
    db.close();
    db = null;
    console.log('[db] Connection closed.');
  }
}

module.exports = { initDatabase, getDatabase, getDb, closeDatabase, auditLog, DB_PATH };

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

/**
 * Initialize the database connection.
 * Must be called after Electron's 'app ready' event.
 * @returns {Database} The connected database instance
 */
function initDatabase() {
  if (db) return db;

  const userDataPath = app.getPath('userData');
  const dbPath = path.join(userDataPath, 'edushare.db');

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

module.exports = { initDatabase, getDatabase, closeDatabase };

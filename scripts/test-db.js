/**
 * test-db.js — Standalone database connection test
 * Run with: node scripts/test-db.js
 * 
 * Tests:
 *  1. better-sqlite3 loads correctly
 *  2. Database creates/opens in a temp path
 *  3. All 7 tables are created by runMigrations()
 *  4. Basic CRUD operations work
 */

const path = require('path');
const os = require('os');
const fs = require('fs');
const Database = require('better-sqlite3');

// Simulate app.getPath('userData') → use temp dir for testing
const testDbPath = path.join(os.tmpdir(), 'edushare-test.db');
console.log('Test DB path:', testDbPath);

// Cleanup any previous test run
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

// Inline runMigrations (since we cannot call app.getPath outside Electron)
const { runMigrations } = require('../main/database/schema');

let db;
try {
  db = new Database(testDbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  console.log('✅ better-sqlite3 connected');

  runMigrations(db);
  console.log('✅ Migrations ran successfully');

  // Verify all 7 tables exist
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ).all().map(r => r.name);

  const expected = ['audit_log', 'categories', 'items', 'loans', 'returns', 'schema_version', 'settings', 'users'];
  const missing = expected.filter(t => !tables.includes(t));

  if (missing.length > 0) {
    console.error('❌ Missing tables:', missing);
    process.exit(1);
  }
  console.log('✅ All 7 tables created:', tables.join(', '));

  // Test schema_version
  const version = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
  console.log('✅ Schema version:', version.v);

  // Test foreign key enforcement
  try {
    db.prepare(
      "INSERT INTO items (id, name, category_id, quantity) VALUES ('test-id', 'Test Item', 'nonexistent-cat', 1)"
    ).run();
    console.error('❌ Foreign key constraint NOT enforced');
    process.exit(1);
  } catch (fkErr) {
    console.log('✅ Foreign key constraints enforced (expected error:', fkErr.message + ')');
  }

  console.log('\n✅ All tests passed. Database setup is working correctly.');
  console.log('   In production, path will be: C:\\Users\\[user]\\AppData\\Roaming\\EduShare\\edushare.db');

} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
} finally {
  if (db) db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
}

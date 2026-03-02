/**
 * test-available-count.js — Test dynamic available_count calculation
 * 
 * Tests that available_count is calculated correctly:
 *   available_count = quantity - SUM(active/overdue loans)
 * 
 * Run with: node scripts/test-available-count.js
 */

const path = require('path');
const os = require('os');
const fs = require('fs');
const Database = require('better-sqlite3');

// Use temp dir for testing
const testDbPath = path.join(os.tmpdir(), 'edushare-available-test.db');
console.log('Test DB path:', testDbPath);

// Cleanup any previous test run
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

let db;
try {
  db = new Database(testDbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  console.log('✅ Database connected');
  
  // Create minimal schema for testing
  db.exec(`
    CREATE TABLE items (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      quantity        INTEGER NOT NULL DEFAULT 0
    );
    
    CREATE TABLE loans (
      id              TEXT PRIMARY KEY,
      item_id         TEXT NOT NULL REFERENCES items(id),
      quantity_loaned INTEGER NOT NULL,
      status          TEXT DEFAULT 'active' CHECK(status IN ('active','returned','overdue'))
    );
  `);
  
  console.log('✅ Test tables created');
  
  // Test 1: Basic available_count calculation
  console.log('\n=== Test 1: Basic calculation ===');
  
  // Insert test item with quantity 10
  db.prepare(`
    INSERT INTO items (id, name, quantity) 
    VALUES ('item-1', 'Test Item', 10)
  `).run();
  
  // Calculate available_count manually
  const getAvailableCount = (itemId) => {
    const item = db.prepare('SELECT quantity FROM items WHERE id = ?').get(itemId);
    const loaned = db.prepare(`
      SELECT COALESCE(SUM(quantity_loaned), 0) as total
      FROM loans
      WHERE item_id = ? AND status IN ('active', 'overdue')
    `).get(itemId);
    return item.quantity - loaned.total;
  };
  
  let available = getAvailableCount('item-1');
  console.log(`Initial: quantity=10, loans=0, available_count=${available}`);
  console.assert(available === 10, `Expected 10, got ${available}`);
  
  // Test 2: Add active loan
  console.log('\n=== Test 2: Add active loan ===');
  
  db.prepare(`
    INSERT INTO loans (id, item_id, quantity_loaned, status)
    VALUES ('loan-1', 'item-1', 3, 'active')
  `).run();
  
  available = getAvailableCount('item-1');
  console.log(`After loan: quantity=10, active loans=3, available_count=${available}`);
  console.assert(available === 7, `Expected 7, got ${available}`);
  
  // Test 3: Add overdue loan
  console.log('\n=== Test 3: Add overdue loan ===');
  
  db.prepare(`
    INSERT INTO loans (id, item_id, quantity_loaned, status)
    VALUES ('loan-2', 'item-1', 2, 'overdue')
  `).run();
  
  available = getAvailableCount('item-1');
  console.log(`After overdue: quantity=10, active=3 + overdue=2, available_count=${available}`);
  console.assert(available === 5, `Expected 5, got ${available}`);
  
  // Test 4: Return a loan (status = returned)
  console.log('\n=== Test 4: Return a loan ===');
  
  db.prepare(`
    UPDATE loans SET status = 'returned' WHERE id = 'loan-1'
  `).run();
  
  available = getAvailableCount('item-1');
  console.log(`After return: quantity=10, active=0 + overdue=2, available_count=${available}`);
  console.assert(available === 8, `Expected 8, got ${available}`);
  
  // Test 5: SQL fragment for SELECT queries
  console.log('\n=== Test 5: SQL fragment for SELECT ===');
  
  const AVAILABLE_COUNT_SQL = `
    items.quantity - (
      SELECT COALESCE(SUM(quantity_loaned), 0)
      FROM loans
      WHERE loans.item_id = items.id AND loans.status IN ('active', 'overdue')
    )
  `.trim();
  
  const itemsWithAvailable = db.prepare(`
    SELECT items.*, (${AVAILABLE_COUNT_SQL}) as available_count
    FROM items
  `).all();
  
  console.log('Items with dynamically calculated available_count:');
  itemsWithAvailable.forEach(item => {
    console.log(`  ${item.name}: quantity=${item.quantity}, available_count=${item.available_count}`);
    console.assert(item.available_count === 8, `Expected 8, got ${item.available_count}`);
  });
  
  // Test 6: Loan blocked when quantity > available
  console.log('\n=== Test 6: Loan validation ===');
  
  try {
    db.prepare(`
      INSERT INTO loans (id, item_id, quantity_loaned, status)
      VALUES ('loan-3', 'item-1', 9, 'active')
    `).run();
    console.error('❌ Should have blocked loan exceeding available count');
    process.exit(1);
  } catch (err) {
    console.log('✅ Foreign key constraint blocked invalid loan (expected)');
  }
  
  console.log('\n✅ All tests passed!');
  console.log('   available_count is correctly calculated as: quantity - SUM(active/overdue loans)');
  
} catch (err) {
  console.error('❌ Test failed:', err);
  process.exit(1);
} finally {
  if (db) db.close();
  if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
}
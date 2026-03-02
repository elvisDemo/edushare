/**
 * schema.js — All CREATE TABLE statements for EduShare
 * 
 * 7 tables:
 *   1. settings      — school branding + app config
 *   2. users         — staff accounts with roles
 *   3. categories    — custom item categories
 *   4. items         — inventory items
 *   5. loans         — active/overdue loan records
 *   6. returns       — return records
 *   7. audit_log     — immutable write history
 * 
 * ALL primary keys are UUID TEXT — never INTEGER AUTOINCREMENT.
 * Foreign key constraints are enforced (pragma foreign_keys = ON).
 */

const MIGRATIONS = [
  {
    version: 1,
    description: 'Initial schema — all 7 tables',
    sql: `
      CREATE TABLE IF NOT EXISTS settings (
        key         TEXT PRIMARY KEY,
        value       TEXT NOT NULL,
        updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by  TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id            TEXT PRIMARY KEY,
        username      TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name     TEXT NOT NULL,
        role          TEXT NOT NULL CHECK(role IN ('super_admin','school_admin','librarian','lab_technician')),
        is_active     INTEGER DEFAULT 1,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by    TEXT,
        last_login    DATETIME
      );

      CREATE TABLE IF NOT EXISTS categories (
        id          TEXT PRIMARY KEY,
        name        TEXT UNIQUE NOT NULL,
        description TEXT,
        is_active   INTEGER DEFAULT 1,
        created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by  TEXT
      );

      CREATE TABLE IF NOT EXISTS items (
        id              TEXT PRIMARY KEY,
        name            TEXT NOT NULL,
        category_id     TEXT REFERENCES categories(id),
        quantity        INTEGER NOT NULL DEFAULT 0,
        available_count INTEGER NOT NULL DEFAULT 0,
        condition       TEXT CHECK(condition IN ('Good','Fair','Poor','Damaged')),
        serial_number   TEXT,
        asset_tag       TEXT,
        description     TEXT,
        owner_school    TEXT,
        location        TEXT,
        purchase_date   DATE,
        cost            REAL,
        image_path      TEXT,
        is_active       INTEGER DEFAULT 1,
        created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by      TEXT,
        updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_by      TEXT
      );

      CREATE TABLE IF NOT EXISTS loans (
        id                   TEXT PRIMARY KEY,
        item_id              TEXT NOT NULL REFERENCES items(id),
        borrower_type        TEXT NOT NULL CHECK(borrower_type IN ('Student','Teacher','Other School','Other')),
        borrower_description TEXT,
        borrower_name        TEXT NOT NULL,
        borrower_id_class    TEXT,
        borrower_contact     TEXT,
        quantity_loaned      INTEGER NOT NULL,
        date_borrowed        DATE NOT NULL,
        due_date             DATE NOT NULL,
        purpose              TEXT,
        notes                TEXT,
        status               TEXT DEFAULT 'active' CHECK(status IN ('active','returned','overdue')),
        created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by           TEXT
      );

      CREATE TABLE IF NOT EXISTS returns (
        id                  TEXT PRIMARY KEY,
        loan_id             TEXT NOT NULL REFERENCES loans(id),
        date_returned       DATE NOT NULL,
        condition_on_return TEXT CHECK(condition_on_return IN ('Good','Fair','Poor','Damaged')),
        return_notes        TEXT,
        is_damaged          INTEGER DEFAULT 0,
        damage_reviewed     INTEGER DEFAULT 0,
        created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by          TEXT
      );

      CREATE TABLE IF NOT EXISTS audit_log (
        id           TEXT PRIMARY KEY,
        action       TEXT NOT NULL,
        table_name   TEXT NOT NULL,
        record_id    TEXT,
        old_values   TEXT,
        new_values   TEXT,
        performed_by TEXT NOT NULL,
        performed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Track schema version
      CREATE TABLE IF NOT EXISTS schema_version (
        version     INTEGER PRIMARY KEY,
        applied_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      );
    `
  }
];

/**
 * Run all pending migrations in a transaction.
 * Safe to call on every app launch — already-applied migrations are skipped.
 * @param {Database} db
 */
function runMigrations(db) {
  // Ensure schema_version table exists first
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version     INTEGER PRIMARY KEY,
      applied_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    );
  `);

  const getVersion = db.prepare('SELECT MAX(version) as v FROM schema_version');
  const { v: currentVersion } = getVersion.get();
  const appliedVersion = currentVersion || 0;

  const pending = MIGRATIONS.filter(m => m.version > appliedVersion);

  if (pending.length === 0) {
    console.log('[schema] All migrations up to date. Version:', appliedVersion);
    return;
  }

  for (const migration of pending) {
    console.log(`[schema] Applying migration v${migration.version}: ${migration.description}`);
    db.transaction(() => {
      db.exec(migration.sql);
      db.prepare('INSERT INTO schema_version (version, description) VALUES (?, ?)').run(
        migration.version,
        migration.description
      );
    })();
    console.log(`[schema] Migration v${migration.version} applied.`);
  }

  console.log('[schema] All migrations complete. Current version:', pending[pending.length - 1].version);
}

module.exports = { runMigrations };

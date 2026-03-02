/**
 * schema.js - All CREATE TABLE statements for EduShare
 *
 * 7 tables:
 *   1. settings      - school branding + app config
 *   2. users         - staff accounts with roles
 *   3. categories    - custom item categories
 *   4. items         - inventory items
 *   5. loans         - active/overdue loan records
 *   6. returns       - return records
 *   7. audit_log     - immutable write history
 *
 * ALL primary keys are UUID TEXT - never INTEGER AUTOINCREMENT.
 * Foreign key constraints are enforced (pragma foreign_keys = ON).
 */

const MIGRATIONS = [
  {
    version: 1,
    description: 'Initial schema - all 7 tables',
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

  {
    version: 2,
    description: 'Performance indexes on all high-traffic columns',
    sql: `
      -- users
      CREATE INDEX IF NOT EXISTS idx_users_username  ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

      -- categories
      CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

      -- items
      CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
      CREATE INDEX IF NOT EXISTS idx_items_is_active   ON items(is_active);
      CREATE INDEX IF NOT EXISTS idx_items_name        ON items(name);
      CREATE INDEX IF NOT EXISTS idx_items_condition   ON items(condition);
      CREATE INDEX IF NOT EXISTS idx_items_location    ON items(location);

      -- loans
      CREATE INDEX IF NOT EXISTS idx_loans_item_id       ON loans(item_id);
      CREATE INDEX IF NOT EXISTS idx_loans_status        ON loans(status);
      CREATE INDEX IF NOT EXISTS idx_loans_due_date      ON loans(due_date);
      CREATE INDEX IF NOT EXISTS idx_loans_borrower_type ON loans(borrower_type);
      CREATE INDEX IF NOT EXISTS idx_loans_date_borrowed ON loans(date_borrowed);

      -- returns
      CREATE INDEX IF NOT EXISTS idx_returns_loan_id         ON returns(loan_id);
      CREATE INDEX IF NOT EXISTS idx_returns_date_returned   ON returns(date_returned);
      CREATE INDEX IF NOT EXISTS idx_returns_is_damaged      ON returns(is_damaged);
      CREATE INDEX IF NOT EXISTS idx_returns_damage_reviewed ON returns(damage_reviewed);

      -- audit_log
      CREATE INDEX IF NOT EXISTS idx_audit_table_name   ON audit_log(table_name);
      CREATE INDEX IF NOT EXISTS idx_audit_record_id    ON audit_log(record_id);
      CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON audit_log(performed_by);
      CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_log(performed_at);
    `
  }
];

/**
 * Run all pending migrations in a transaction.
 * Safe to call on every app launch - already-applied migrations are skipped.
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

/**
 * Get the currently applied schema version from the database.
 * Returns 0 if schema_version table doesn't exist yet.
 * @param {Database} db
 * @returns {number}
 */
function getSchemaVersion(db) {
  try {
    const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get();
    return row && row.v !== null ? row.v : 0;
  } catch {
    return 0;
  }
}

/** The latest schema version defined in MIGRATIONS array */
const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

module.exports = { runMigrations, getSchemaVersion, SCHEMA_VERSION };

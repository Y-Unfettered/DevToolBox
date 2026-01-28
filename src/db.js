const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'devtoolbox.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');
  db.run(`
    CREATE TABLE IF NOT EXISTS tools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      icon TEXT,
      category TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category)');
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name ON categories(name)');
  db.run(`
    INSERT OR IGNORE INTO categories (name)
    SELECT DISTINCT category FROM tools
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run(
    `INSERT OR IGNORE INTO settings (key, value) VALUES
      ('siteName', 'DevToolBox'),
      ('siteSubtitle', '为开发者而生'),
      ('footerText', '© 2026 DevToolBox Project. All rights reserved.'),
      ('githubUrl', ''),
      ('zsxqUrl', ''),
      ('contactEmail', '')`
  );
});

module.exports = db;

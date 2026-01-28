const fs = require('fs');
const path = require('path');
const db = require('./db');

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function exportData() {
  const tools = await all(
    `SELECT id, title, summary, icon, category, url, created_at, updated_at
     FROM tools
     ORDER BY created_at DESC`
  );
  const settings = await all('SELECT key, value FROM settings ORDER BY key ASC');
  const categories = await all('SELECT name FROM categories ORDER BY name ASC');

  const payload = {
    generatedAt: new Date().toISOString(),
    tools: { items: tools, total: tools.length },
    settings: { items: settings },
    categories: { items: categories.map((row) => row.name) }
  };

  const outDir = path.join(__dirname, '..', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'devtoolbox.json');
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

  return { payload, outPath };
}

module.exports = { exportData };

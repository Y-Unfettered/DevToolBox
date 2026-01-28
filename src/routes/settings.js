const express = require('express');
const db = require('../db');

const router = express.Router();

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes });
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

router.get('/', async (req, res) => {
  try {
    const items = await all('SELECT key, value FROM settings ORDER BY key ASC');
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings.' });
  }
});

router.put('/', async (req, res) => {
  const settings = (req.body && req.body.settings) || {};
  const entries = Object.entries(settings);
  if (!entries.length) {
    return res.status(400).json({ error: 'settings is required.' });
  }

  try {
    for (const [key, value] of entries) {
      if (!isNonEmptyString(key)) continue;
      const val = value === null || value === undefined ? '' : String(value);
      await run(
        'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime(\'now\')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime(\'now\')',
        [key.trim(), val]
      );
    }

    const items = await all('SELECT key, value FROM settings ORDER BY key ASC');
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

module.exports = router;

const express = require('express');
const db = require('../db');

const router = express.Router();
const DEFAULT_CATEGORY = '未分类';

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
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
    const items = await all(
      `SELECT c.id, c.name,
              COALESCE(t.cnt, 0) AS count
         FROM categories c
         LEFT JOIN (
           SELECT category, COUNT(*) AS cnt
           FROM tools
           GROUP BY category
         ) t ON t.category = c.name
        ORDER BY c.name ASC`
    );
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load categories.' });
  }
});

router.post('/', async (req, res) => {
  const name = (req.body && req.body.name) || '';
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    await run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name.trim()]);
    const item = await get(
      'SELECT id, name FROM categories WHERE name = ?',
      [name.trim()]
    );
    res.status(201).json({ id: item.id, name: item.name, count: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const name = (req.body && req.body.name) || '';
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id.' });
  }
  if (!isNonEmptyString(name)) {
    return res.status(400).json({ error: 'name is required.' });
  }

  try {
    const existing = await get('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Category not found.' });

    await run('UPDATE categories SET name = ?, updated_at = datetime(\'now\') WHERE id = ?', [
      name.trim(),
      id
    ]);
    await run('UPDATE tools SET category = ? WHERE category = ?', [
      name.trim(),
      existing.name
    ]);

    const countRow = await get('SELECT COUNT(*) AS cnt FROM tools WHERE category = ?', [
      name.trim()
    ]);

    res.json({ id, name: name.trim(), count: countRow ? countRow.cnt : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id.' });
  }

  try {
    const existing = await get('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (!existing) return res.status(404).json({ error: 'Category not found.' });

    if (existing.name === DEFAULT_CATEGORY) {
      return res.status(400).json({ error: 'Default category cannot be deleted.' });
    }

    await run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [DEFAULT_CATEGORY]);
    await run('UPDATE tools SET category = ? WHERE category = ?', [DEFAULT_CATEGORY, existing.name]);
    await run('DELETE FROM categories WHERE id = ?', [id]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;

const express = require('express');
const db = require('../db');

const router = express.Router();

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

function isValidUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidIconValue(value) {
  if (!isNonEmptyString(value)) return false;
  if (isValidUrl(value)) return true;
  return /^[a-z0-9-]+:[a-z0-9-]+$/i.test(value.trim());
}

async function ensureCategory(name) {
  if (!isNonEmptyString(name)) return;
  await run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name.trim()]);
}

async function cleanupEmptyCategories() {
  await run(
    `DELETE FROM categories
     WHERE name NOT IN (SELECT DISTINCT category FROM tools)`
  );
}

function validateToolPayload(payload, { partial = false } = {}) {
  const errors = [];
  const fields = ['title', 'summary', 'icon', 'category', 'url'];
  const hasAny = fields.some((f) => payload[f] !== undefined);

  if (!partial && !hasAny) {
    errors.push('Request body is required.');
  }

  if (payload.title !== undefined && !isNonEmptyString(payload.title)) {
    errors.push('title is required.');
  }
  if (payload.summary !== undefined && !isNonEmptyString(payload.summary)) {
    errors.push('summary is required.');
  }
  if (payload.category !== undefined && !isNonEmptyString(payload.category)) {
    errors.push('category is required.');
  }
  if (payload.url !== undefined && !isValidUrl(payload.url)) {
    errors.push('url must be a valid URL.');
  }
  if (payload.icon !== undefined && payload.icon !== null && payload.icon !== '' && !isValidIconValue(payload.icon)) {
    errors.push('icon must be a valid URL or an Iconify name (e.g. logos:github).');
  }

  return errors;
}

router.get('/', async (req, res) => {
  const { q, category } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

  const where = [];
  const params = [];

  if (isNonEmptyString(category)) {
    where.push('category = ?');
    params.push(category.trim());
  }
  if (isNonEmptyString(q)) {
    where.push('(title LIKE ? OR summary LIKE ?)');
    const like = `%${q.trim()}%`;
    params.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const items = await all(
      `SELECT id, title, summary, icon, category, url, created_at, updated_at
       FROM tools
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countRow = await get(`SELECT COUNT(*) AS total FROM tools ${whereSql}`, params);

    res.json({ items, total: countRow ? countRow.total : 0, limit, offset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tools.' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id.' });
  }

  try {
    const item = await get(
      'SELECT id, title, summary, icon, category, url, created_at, updated_at FROM tools WHERE id = ?',
      [id]
    );
    if (!item) return res.status(404).json({ error: 'Tool not found.' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load tool.' });
  }
});

router.post('/', async (req, res) => {
  const payload = req.body || {};
  const errors = validateToolPayload(payload, { partial: false });
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }

  const { title, summary, icon = null, category, url } = payload;

  try {
    const result = await run(
      `INSERT INTO tools (title, summary, icon, category, url)
       VALUES (?, ?, ?, ?, ?)`,
      [title.trim(), summary.trim(), icon ? icon.trim() : null, category.trim(), url.trim()]
    );
    await ensureCategory(category);

    const item = await get(
      'SELECT id, title, summary, icon, category, url, created_at, updated_at FROM tools WHERE id = ?',
      [result.id]
    );

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create tool.' });
  }
});

router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id.' });
  }

  const payload = req.body || {};
  const errors = validateToolPayload(payload, { partial: true });
  if (errors.length) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }

  const updates = [];
  const params = [];

  if (payload.title !== undefined) {
    updates.push('title = ?');
    params.push(payload.title.trim());
  }
  if (payload.summary !== undefined) {
    updates.push('summary = ?');
    params.push(payload.summary.trim());
  }
  if (payload.icon !== undefined) {
    updates.push('icon = ?');
    params.push(payload.icon ? payload.icon.trim() : null);
  }
  if (payload.category !== undefined) {
    updates.push('category = ?');
    params.push(payload.category.trim());
  }
  if (payload.url !== undefined) {
    updates.push('url = ?');
    params.push(payload.url.trim());
  }

  if (!updates.length) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  updates.push("updated_at = datetime('now')");

  try {
    const result = await run(
      `UPDATE tools SET ${updates.join(', ')} WHERE id = ?`,
      [...params, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tool not found.' });
    }

    const item = await get(
      'SELECT id, title, summary, icon, category, url, created_at, updated_at FROM tools WHERE id = ?',
      [id]
    );
    if (payload.category !== undefined) {
      await ensureCategory(payload.category);
      await cleanupEmptyCategories();
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update tool.' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid id.' });
  }

  try {
    const result = await run('DELETE FROM tools WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Tool not found.' });
    }
    await cleanupEmptyCategories();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tool.' });
  }
});

module.exports = router;

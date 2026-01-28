const express = require('express');
const db = require('../db');

const router = express.Router();

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

router.get('/', async (req, res) => {
  try {
    const totalToolsRow = await get('SELECT COUNT(*) AS count FROM tools');
    const totalCategoriesRow = await get('SELECT COUNT(*) AS count FROM categories');
    const last30Row = await get(
      "SELECT COUNT(*) AS count FROM tools WHERE datetime(created_at) >= datetime('now','-30 days')"
    );
    const latestTools = await all(
      `SELECT id, title, category, url, created_at
       FROM tools
       ORDER BY datetime(created_at) DESC
       LIMIT 5`
    );
    const topCategories = await all(
      `SELECT category AS name, COUNT(*) AS count
       FROM tools
       GROUP BY category
       ORDER BY count DESC, name ASC
       LIMIT 5`
    );

    res.json({
      totalTools: totalToolsRow ? totalToolsRow.count : 0,
      totalCategories: totalCategoriesRow ? totalCategoriesRow.count : 0,
      toolsLast30Days: last30Row ? last30Row.count : 0,
      latestTools,
      topCategories
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

module.exports = router;

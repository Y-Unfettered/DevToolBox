const express = require('express');
const path = require('path');
const { exportData } = require('../exporter');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { payload, outPath } = await exportData();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${path.basename(outPath)}"`
    );
    res.send(JSON.stringify(payload, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data.' });
  }
});

module.exports = router;

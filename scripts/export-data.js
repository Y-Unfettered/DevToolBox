const { exportData } = require('../src/exporter');
const db = require('../src/db');

exportData()
  .then(({ payload, outPath }) => {
    console.log(`Exported ${payload.tools.total} tools to ${outPath}`);
  })
  .catch((err) => {
    console.error('Failed to export data:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });

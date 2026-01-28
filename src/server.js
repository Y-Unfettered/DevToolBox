const express = require('express');
const cors = require('cors');
const path = require('path');
require('./db');
const toolsRouter = require('./routes/tools');
const categoriesRouter = require('./routes/categories');
const statsRouter = require('./routes/stats');
const settingsRouter = require('./routes/settings');
const exportRouter = require('./routes/export');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tools', toolsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/export', exportRouter);

const rootDir = path.join(__dirname, '..');
const uiDir = path.join(rootDir, 'UI');
app.use(express.static(rootDir));
app.use(express.static(uiDir));

const port = parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => {
  console.log(`DevToolBox API listening on http://localhost:${port}`);
});

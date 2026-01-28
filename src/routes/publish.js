const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const router = express.Router();

function isLocalRequest(req) {
  const addr = req.socket && req.socket.remoteAddress;
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

router.post('/', async (req, res) => {
  if (!isLocalRequest(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const message = req.body && typeof req.body.message === 'string' ? req.body.message : 'Update data';
  const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'publish.ps1');
  const args = [
    '-ExecutionPolicy',
    'Bypass',
    '-File',
    scriptPath,
    '-Message',
    message
  ];

  const child = spawn('powershell', args, { cwd: path.join(__dirname, '..', '..') });
  let stdout = '';
  let stderr = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });

  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  child.on('error', (err) => {
    res.status(500).json({ error: 'Failed to start publish script.', details: err.message });
  });

  child.on('close', (code) => {
    if (code === 0) {
      res.json({ ok: true, output: stdout.trim() });
    } else {
      res.status(500).json({ error: 'Publish failed.', code, output: stdout.trim(), details: stderr.trim() });
    }
  });
});

module.exports = router;

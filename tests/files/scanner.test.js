const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { scan } = require('../../modules/files/scanner');
test('clamd: clean, infected, unavailable, timeout; required scan fails closed', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'pb-files-scanner-'));
  const filename = path.join(directory, 'file'); await fs.writeFile(filename, 'test data');
  process.env.UPLOAD_SCAN_REQUIRED = '1'; process.env.UPLOAD_CLAMD_HOST = '';
  await assert.rejects(scan(filename), error => error.status === 503);
  let reply = 'stream: OK\0';
  const server = net.createServer(socket => {
    let buffer = Buffer.alloc(0), header = false;
    socket.on('error', () => {});
    socket.on('data', chunk => {
      buffer = Buffer.concat([buffer, chunk]);
      if (!header) { if (buffer.length < 10) return; assert.equal(buffer.subarray(0, 10).toString(), 'zINSTREAM\0'); buffer = buffer.subarray(10); header = true; }
      while (buffer.length >= 4) {
        const length = buffer.readUInt32BE(0); if (buffer.length < length + 4) return;
        buffer = buffer.subarray(4 + length);
        if (!length) { if (reply) socket.end(reply); return; }
      }
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  process.env.UPLOAD_CLAMD_HOST = '127.0.0.1'; process.env.UPLOAD_CLAMD_PORT = String(server.address().port);
  try {
    assert.equal(await scan(filename), 'clean');
    reply = 'stream: Eicar FOUND\0'; await assert.rejects(scan(filename), error => error.status === 422);
    reply = 'stream: ERROR\0'; await assert.rejects(scan(filename), error => error.status === 503);
    reply = ''; process.env.UPLOAD_SCAN_TIMEOUT_MS = '80'; await assert.rejects(scan(filename), error => error.status === 503);
  } finally {
    await new Promise(resolve => server.close(resolve)); await fs.rm(directory, { recursive: true, force: true });
    for (const key of ['UPLOAD_CLAMD_HOST', 'UPLOAD_CLAMD_PORT', 'UPLOAD_SCAN_TIMEOUT_MS', 'UPLOAD_SCAN_REQUIRED']) delete process.env[key];
  }
});

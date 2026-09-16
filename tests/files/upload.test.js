const { test, mock } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const { Writable } = require('node:stream');
const { receive } = require('../../modules/files/upload');

test('Multer diskStorage: exact size, excess, timeout, abort, malformed body and disk full', async () => {
  const directory = await fsp.mkdtemp(path.join(os.tmpdir(), 'pb-files-stream-'));
  process.env.UPLOAD_STORAGE_PATH = directory; process.env.UPLOAD_MAX_BYTES = '1024'; process.env.UPLOAD_TIMEOUT_MS = '100';
  let counter = 0; const statuses = [];
  const server = http.createServer(async (request, response) => {
    const filename = path.join(directory, String(counter++));
    request.fileReservationId = path.basename(filename);
    try { await receive(request, response); statuses.push(201); response.writeHead(201).end(); }
    catch (error) { statuses.push(error.status); if (!response.destroyed) response.writeHead(error.status || 500).end(); }
    finally { await fsp.rm(filename, { force: true }); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const head = '--boundary\r\nContent-Disposition: form-data; name="file"; filename="plik.pdf"\r\nContent-Type: application/pdf\r\n\r\n';
  const tail = '\r\n--boundary--\r\n';
  const send = (body, end = true) => new Promise((resolve, reject) => {
    const request = http.request({ host: '127.0.0.1', port, method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=boundary' } }, response => { response.resume(); resolve(response.statusCode); request.end(); });
    request.on('error', reject); request.write(body); if (end) request.end();
  });
  try {
    // The advertised Multer maximum is inclusive.
    assert.equal(await send(head + 'a'.repeat(1024) + tail), 201);
    assert.equal(await send(head + 'a'.repeat(1025) + tail), 413);
    assert.equal(await send(head + 'partial', false), 408);
    assert.equal(await send('not multipart'), 422);
    await new Promise(resolve => {
      const request = http.request({ host: '127.0.0.1', port, method: 'POST', headers: { 'Content-Type': 'multipart/form-data; boundary=boundary' } });
      request.on('error', () => resolve()); request.write(head + 'partial'); setTimeout(() => request.destroy(), 30);
    });
    await new Promise(resolve => setTimeout(resolve, 50));
    assert.ok(statuses.includes(400));
    const original = fs.createWriteStream;
    const replacement = mock.method(fs, 'createWriteStream', () => new Writable({ write(chunk, encoding, callback) { callback(Object.assign(new Error('full'), { code: 'ENOSPC' })); } }));
    try { assert.equal(await send(head + 'data' + tail), 507); } finally { replacement.mock.restore(); assert.equal(fs.createWriteStream, original); }
  } finally {
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await fsp.rm(directory, { recursive: true, force: true }); delete process.env.UPLOAD_STORAGE_PATH; delete process.env.UPLOAD_MAX_BYTES; delete process.env.UPLOAD_TIMEOUT_MS;
  }
});

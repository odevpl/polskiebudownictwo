require('dotenv').config({ quiet: true });
const { randomUUID } = require('node:crypto');
const fs = require('node:fs/promises');
const pool = require('../config/database');
const { config } = require('../modules/files/config');
const storage = require('../modules/files/storage');
const { scan } = require('../modules/files/scanner');
const { inspect } = require('../modules/files/validate');
async function check() {
  const settings = config(); await storage.init();
  const [[usage]] = await pool.query('SELECT COUNT(*) AS files, COALESCE(SUM(size_bytes),0) AS bytes FROM files');
  await pool.query('SELECT id FROM file_storage_lock WHERE id=1');
  const { PDFDocument } = require('pdf-lib');
  const document = await PDFDocument.create(); document.addPage();
  const key = randomUUID(); let created = false;
  try {
    await fs.writeFile(storage.location(key), await document.save(), { flag: 'wx', mode: 0o600 }); created = true;
    const scanStatus = await scan(storage.location(key));
    await inspect(storage.location(key), 'test.pdf', 'application/pdf');
    const sharp = require('sharp');
    await sharp({ create: { width: 2, height: 2, channels: 3, background: '#fff' } }).webp().toBuffer();
    console.log(JSON.stringify({ healthy: true, scanStatus, files: usage.files, bytes: Number(usage.bytes), capacity: settings.storageBytes, nearCapacity: Number(usage.bytes) > settings.storageBytes * 0.8 }));
  } finally { if (created) await storage.remove(key); }
}
check().catch(error => { console.error(JSON.stringify({ healthy: false, code: error.status || error.code || error.name })); process.exitCode = 1; }).finally(() => pool.end());

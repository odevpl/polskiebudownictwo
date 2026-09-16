const fs = require('node:fs/promises');
const pool = require('../../config/database');
const storage = require('./storage');
const { transaction } = require('./repository');
const { config, audit } = require('./config');

async function cleanup() {
  await storage.init();
  const settings = config();
  const staleSeconds = Math.ceil((settings.timeoutMs + settings.scanTimeoutMs + 15000) / 1000) + 600;
  const [candidates] = await pool.execute(`SELECT f.id FROM files f WHERE
    (f.status = 'uploading' AND f.created_at < DATE_SUB(NOW(), INTERVAL ? SECOND)) OR
    (f.attached_at IS NULL AND f.created_at < DATE_SUB(NOW(), INTERVAL ? HOUR)) OR
    (f.attached_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lesson_attachments a WHERE a.file_id = f.id))`, [staleSeconds, settings.ttlHours]);
  let removed = 0;
  for (const item of candidates) {
    await transaction(async connection => {
      const [rows] = await connection.execute(`SELECT f.* FROM files f WHERE f.id = ? AND NOT EXISTS (SELECT 1 FROM lesson_attachments a WHERE a.file_id = f.id) FOR UPDATE`, [item.id]);
      const file = rows[0]; if (!file) return;
      const age = (Date.now() - new Date(file.created_at).getTime()) / 1000;
      if (file.attached_at === null && age < (file.status === 'uploading' ? staleSeconds : settings.ttlHours * 3600)) return;
      try {
        await storage.remove(file.storage_key);
        await connection.execute('DELETE FROM files WHERE id = ?', [file.id]);
        removed++; audit('deleted', { fileId: file.id });
      } catch { audit('delete_retry', { fileId: file.id }); }
    });
  }
  // A crash/restore can leave a disk object without its DB reservation. Never touch fresh objects.
  for (const entry of await fs.readdir(settings.storage, { withFileTypes: true })) {
    if (!entry.isFile() || !storage.keyPattern.test(entry.name)) continue;
    await transaction(async connection => {
      const [[row]] = await connection.execute('SELECT COUNT(*) AS count FROM files WHERE storage_key = ?', [entry.name]);
      let stat;
      try { stat = await fs.lstat(storage.location(entry.name)); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
      if (!row.count && Date.now() - stat.mtimeMs > settings.ttlHours * 3600000) { await storage.remove(entry.name); removed++; }
    });
  }
  const [ready] = await pool.query("SELECT id, storage_key FROM files WHERE status = 'ready'");
  for (const file of ready) if (!await storage.exists(file.storage_key)) audit('missing_object', { fileId: file.id });
  await pool.query('DELETE FROM file_upload_attempts WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 DAY)');
  const [[usage]] = await pool.query('SELECT COALESCE(SUM(size_bytes), 0) AS bytes, COUNT(*) AS count FROM files');
  audit('cleanup', { removed, bytes: Number(usage.bytes), count: usage.count, capacity: settings.storageBytes });
  return { removed, ...usage };
}
function startCleanupWorker() {
  let running = false;
  const timer = setInterval(async () => {
    if (running) return;
    running = true;
    try { await cleanup(); } catch (error) { audit('cleanup_failed', { code: error.code || 'INTERNAL' }); }
    finally { running = false; }
  }, 15 * 60 * 1000);
  timer.unref();
  return timer;
}
module.exports = { cleanup, startCleanupWorker };

const { randomUUID } = require('node:crypto');
const pool = require('../../config/database');
const { config, FileError, audit } = require('./config');

// The same database mutex guards quotas, attachment commits and cleanup across Passenger workers.
async function transaction(work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [lock] = await connection.query('SELECT id FROM file_storage_lock WHERE id = 1 FOR UPDATE');
    if (!lock.length) throw new Error('File storage lock is not initialized');
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
}
async function reserve(adminId) {
  const settings = config();
  return transaction(async connection => {
    const [[usage]] = await connection.execute(`SELECT COALESCE(SUM(size_bytes), 0) AS total,
      COALESCE(SUM(CASE WHEN uploaded_by = ? AND attached_at IS NULL THEN size_bytes ELSE 0 END), 0) AS temporary_bytes,
      SUM(CASE WHEN uploaded_by = ? AND attached_at IS NULL THEN 1 ELSE 0 END) AS temporary_count,
      SUM(status = 'uploading') AS concurrent_count,
      SUM(status = 'uploading' AND uploaded_by = ?) AS admin_concurrent_count FROM files`, [adminId, adminId, adminId]);
    if (Number(usage.concurrent_count) >= settings.concurrentFiles || Number(usage.admin_concurrent_count) >= settings.adminConcurrentFiles) throw new FileError('Inne pliki są jeszcze przesyłane. Poczekaj i ponów upload.', 429);
    if (Number(usage.total) + settings.maxBytes > settings.storageBytes) throw new FileError('Magazyn plików jest pełny.', 507);
    if (Number(usage.temporary_bytes) + settings.maxBytes > settings.temporaryBytes || Number(usage.temporary_count) >= settings.temporaryFiles) throw new FileError('Osiągnięto limit plików tymczasowych. Zapisz lekcję lub usuń niepotrzebne uploady.', 429);
    // Persistent rolling rate limits apply across all Node workers.
    const [[rate]] = await connection.execute('SELECT COUNT(*) AS count FROM file_upload_attempts WHERE admin_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)', [adminId]);
    if (rate.count >= 60) throw new FileError('Zbyt wiele uploadów. Spróbuj za kilka minut.', 429);
    await connection.execute('INSERT INTO file_upload_attempts (admin_id) VALUES (?)', [adminId]);
    const id = randomUUID();
    await connection.execute(`INSERT INTO files (id, storage_key, original_name, mime_type, size_bytes, status, uploaded_by) VALUES (?, ?, '', '', ?, 'uploading', ?)`, [id, id, settings.maxBytes, adminId]);
    audit('reserved', { fileId: id, adminId, bytes: Number(usage.total) + settings.maxBytes, capacity: settings.storageBytes });
    return id;
  });
}
async function ready(id, metadata, scanStatus) {
  await transaction(async connection => {
    const [result] = await connection.execute(`UPDATE files SET original_name = ?, mime_type = ?, size_bytes = ?, status = 'ready', scan_status = ? WHERE id = ? AND status = 'uploading'`, [metadata.name, metadata.mime, metadata.size, scanStatus, id]);
    if (!result.affectedRows) throw new FileError('Upload wygasł. Prześlij plik ponownie.', 409);
  });
  return find(id);
}
async function find(id) { const [rows] = await pool.execute('SELECT * FROM files WHERE id = ?', [id]); return rows[0] || null; }
function readable(file) { return file?.status === 'ready' && (!config().scanRequired || file.scan_status === 'clean'); }
function metadata(file, url) { return { id: file.id, name: file.original_name, mime: file.mime_type, size: Number(file.size_bytes), url }; }
async function canManage(file, adminId) {
  if (!readable(file)) return false;
  if (file.attached_at === null) return file.uploaded_by === adminId && Date.now() - new Date(file.created_at).getTime() < config().ttlHours * 3600000;
  const [[row]] = await pool.execute('SELECT COUNT(*) AS count FROM lesson_attachments WHERE file_id = ?', [file.id]);
  return row.count > 0;
}
module.exports = { transaction, reserve, ready, find, readable, metadata, canManage };

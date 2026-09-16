const storage = require('./storage');
const repository = require('./repository');
const { receive } = require('./upload');
const { inspect } = require('./validate');
const { scan } = require('./scanner');
const { audit } = require('./config');

async function upload(request, response, adminId) {
  await storage.init();
  const id = await repository.reserve(adminId);
  request.fileReservationId = id;
  try {
    const info = await receive(request, response);
    await storage.restrict(id);
    // Scan before complex parsing; validation still applies if development explicitly skips the scanner.
    const scanStatus = await scan(storage.location(id));
    const metadata = await inspect(storage.location(id), info.originalname, info.mimetype);
    const file = await repository.ready(id, metadata, scanStatus);
    audit('accepted', { fileId: id, adminId, scanStatus, bytes: metadata.size });
    return file;
  } catch (error) {
    audit('rejected', { fileId: id, adminId, code: error.status || 500 });
    // Keep the reservation if unlink fails, so cleanup retries and quota accounting remains conservative.
    try { await discard(id, adminId); } catch { audit('cleanup_failed', { fileId: id }); }
    throw error;
  }
}
async function discard(id, adminId) {
  return repository.transaction(async connection => {
    const [rows] = await connection.execute('SELECT * FROM files WHERE id = ? FOR UPDATE', [id]);
    const file = rows[0];
    if (!file || file.uploaded_by !== adminId || file.attached_at !== null) return false;
    await storage.remove(file.storage_key);
    await connection.execute('DELETE FROM files WHERE id = ?', [id]);
    audit('discarded', { fileId: id, adminId });
    return true;
  });
}
module.exports = { upload, discard, storage, repository };

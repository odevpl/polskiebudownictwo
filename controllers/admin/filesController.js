const pool = require('../../config/database');
const { upload, discard, repository } = require('../../modules/files');
const { FileError } = require('../../modules/files/config');
const { send, fail } = require('../../modules/files/download');

async function requireFileAdmin(request, response, next) {
  response.setHeader('Cache-Control', 'private, no-store');
  try {
    const id = request.session?.admin?.id;
    if (!id) return response.status(401).json({ success: false, message: 'Zaloguj się ponownie do panelu.' });
    const [[admin]] = await pool.execute('SELECT id, role, is_active FROM admins WHERE id = ?', [id]);
    if (!admin?.is_active || !['admin', 'superadmin'].includes(admin.role)) return response.status(403).json({ success: false, message: 'Brak uprawnień.' });
    if (!['GET', 'HEAD'].includes(request.method)) {
      const expected = `${request.protocol}://${request.get('host')}`;
      let source = request.get('origin');
      if (!source) { try { source = new URL(request.get('referer')).origin; } catch { /* deny */ } }
      if (source !== expected) return response.status(403).json({ success: false, message: 'Nieprawidłowe źródło żądania.' });
    }
    next();
  } catch (error) { fail(response, error); }
}
async function create(request, response) {
  try {
    const file = await upload(request, response, request.session.admin.id);
    response.status(201).json({ success: true, file: { ...repository.metadata(file, request.app.locals.adminUrl(`/files/${file.id}/download`)), temporary: true } });
  } catch (error) { fail(response, error); }
}
async function remove(request, response) {
  try {
    const file = await repository.find(request.params.id);
    if (file?.status === 'uploading') throw new FileError('Upload jeszcze trwa.', 409);
    if (!await discard(request.params.id, request.session.admin.id)) throw new FileError('Plik nie istnieje lub jest już przypisany do lekcji.', 404);
    response.json({ success: true });
  } catch (error) { fail(response, error); }
}
async function download(request, response) {
  try {
    const file = await repository.find(request.params.id);
    if (!await repository.canManage(file, request.session.admin.id)) throw new FileError('Plik nie istnieje.', 404);
    await send(request, response, file, { adminId: request.session.admin.id });
  } catch (error) { fail(response, error); }
}
module.exports = { requireFileAdmin, create, remove, download, send, fail };

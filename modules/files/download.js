const storage = require('./storage');
const { FileError, audit } = require('./config');
function fail(response, error) {
  const status = error instanceof FileError ? error.status : 500;
  audit('request_failed', { code: status });
  if (!response.headersSent && !response.destroyed) response.status(status).json({ success: false, message: error instanceof FileError ? error.message : 'Nie udało się wykonać operacji na pliku.' });
}
async function send(request, response, file, actor) {
  if (!await storage.exists(file.storage_key)) throw new FileError('Plik jest chwilowo niedostępny.', 404);
  response.set({ 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Type': file.mime_type });
  response.download(storage.location(file.storage_key), file.original_name, { dotfiles: 'deny', acceptRanges: false, cacheControl: false, lastModified: false }, error => {
    audit('download', { fileId: file.id, ...actor, result: error ? 'failed' : 'sent' });
    if (error && !response.headersSent) fail(response, new FileError('Nie udało się pobrać pliku.', 404));
  });
}
module.exports = { send, fail };

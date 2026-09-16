const path = require('node:path');

function number(name, fallback, minimum = 1) {
  const value = Number(process.env[name] || fallback);
  if (!Number.isSafeInteger(value) || value < minimum) throw new Error(`Invalid ${name}`);
  return value;
}
function config() {
  const root = path.resolve(__dirname, '../..');
  const storage = path.resolve(process.env.UPLOAD_STORAGE_PATH || path.join(root, 'storage/files'));
  for (const directory of ['page', 'public', 'dists', 'dist', 'subdomain']) {
    const relative = path.relative(path.join(root, directory), storage);
    if (!relative || (!relative.startsWith('..') && !path.isAbsolute(relative))) throw new Error('Upload storage must be private');
  }
  if (process.env.NODE_ENV === 'production' && (!process.env.UPLOAD_STORAGE_PATH || !path.isAbsolute(process.env.UPLOAD_STORAGE_PATH))) throw new Error('Production requires absolute UPLOAD_STORAGE_PATH outside the deployment directory');
  const relativeToApp = path.relative(root, storage);
  if (process.env.NODE_ENV === 'production' && (!relativeToApp || (!relativeToApp.startsWith('..') && !path.isAbsolute(relativeToApp)))) throw new Error('Production storage must be outside the deployment directory');
  return {
    storage,
    maxBytes: number('UPLOAD_MAX_BYTES', 20 * 1024 * 1024),
    lessonFiles: number('UPLOAD_LESSON_FILES', 10),
    lessonBytes: number('UPLOAD_LESSON_BYTES', 100 * 1024 * 1024),
    maxBlocks: number('UPLOAD_MAX_BLOCKS', 50),
    temporaryFiles: number('UPLOAD_TEMP_FILES', 30),
    temporaryBytes: number('UPLOAD_TEMP_BYTES', 200 * 1024 * 1024),
    storageBytes: number('UPLOAD_STORAGE_BYTES', 5 * 1024 * 1024 * 1024),
    ttlHours: number('UPLOAD_TEMP_HOURS', 24),
    timeoutMs: number('UPLOAD_TIMEOUT_MS', 120000),
    maxPixels: number('UPLOAD_MAX_PIXELS', 25000000),
    concurrentFiles: number('UPLOAD_CONCURRENT_FILES', 4),
    adminConcurrentFiles: number('UPLOAD_ADMIN_CONCURRENT_FILES', 2),
    docx: process.env.UPLOAD_DOCX_ENABLED === '1',
  };
}
class FileError extends Error {
  constructor(message, status = 422) { super(message); this.status = status; }
}
function audit(event, details = {}) {
  // Only callers' IDs, counters and outcome codes belong here, never filenames or content.
  console.info(JSON.stringify({ module: 'files', event, at: new Date().toISOString(), ...details }));
}
module.exports = { config, FileError, audit };

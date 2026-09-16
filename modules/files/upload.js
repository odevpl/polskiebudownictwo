const multer = require('multer');
const { config, FileError } = require('./config');

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

const diskStorage = multer.diskStorage({
  destination(request, file, callback) {
    callback(null, config().storage);
  },
  filename(request, file, callback) {
    if (!request.fileReservationId) return callback(new Error('Missing upload reservation'));
    callback(null, request.fileReservationId);
  },
});

const upload = multer({
  storage: diskStorage,
  fileFilter(request, file, callback) {
    const allowed = allowedMimeTypes.has(file.mimetype);
    callback(allowed ? null : new FileError('Dozwolone formaty: PDF, JPG, WebP' + (config().docx ? ', DOCX.' : '.')), allowed);
  },
  limits: { fileSize: config().maxBytes, files: 1, fields: 0, parts: 1, headerPairs: 20 },
});

function multerError(error) {
  if (error instanceof FileError) return error;
  if (error instanceof multer.MulterError) {
    const errors = {
      LIMIT_FILE_SIZE: ['Plik przekracza dozwolony rozmiar.', 413],
      LIMIT_FILE_COUNT: ['Wyślij tylko jeden plik.', 422],
      LIMIT_FIELD_COUNT: ['Formularz uploadu nie może zawierać dodatkowych pól.', 422],
      LIMIT_PART_COUNT: ['Wyślij tylko jeden plik, bez dodatkowych pól.', 422],
      LIMIT_UNEXPECTED_FILE: ['Wyślij jeden plik w polu file.', 422],
    };
    const [message, status] = errors[error.code] || ['Nieprawidłowy formularz uploadu.', 422];
    return new FileError(message, status);
  }
  if (error?.code === 'ENOSPC' || error?.code === 'EDQUOT') return new FileError('Brak miejsca na serwerze.', 507);
  if (error?.code === 'EACCES' || error?.code === 'EPERM' || error?.code === 'EROFS') return new FileError('Serwer nie może zapisać przesyłanego pliku.', 500);
  if (/multipart|boundary|unexpected end of form/i.test(error?.message || '')) return new FileError('Nieprawidłowy lub niekompletny formularz uploadu.');
  return new FileError('Nie udało się zapisać przesyłanego pliku.', 500);
}

function originalName(name) {
  if (![...name].every(character => character.codePointAt(0) <= 255)) return name;
  const decoded = Buffer.from(name, 'latin1').toString('utf8');
  return decoded.includes('\ufffd') ? name : decoded;
}

function receive(request, response) {
  const middleware = upload.single('file');
  return new Promise((resolve, reject) => {
    if (!/^multipart\/form-data(?:;|$)/i.test(request.headers['content-type'] || '')) {
      reject(new FileError('Wymagany jest formularz multipart z jednym plikiem.'));
      return;
    }
    let settled = false;
    const finish = (error, file) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      request.off('aborted', aborted);
      request.off('error', aborted);
      error ? reject(multerError(error)) : resolve(file);
    };
    const aborted = () => finish(new FileError('Przesyłanie zostało przerwane.', 400));
    const timer = setTimeout(() => {
      const error = new FileError('Przesyłanie przekroczyło limit czasu.', 408);
      finish(error);
      request.destroy(error);
    }, config().timeoutMs);
    request.once('aborted', aborted);
    request.once('error', aborted);
    middleware(request, response, error => {
      if (error) return finish(error);
      if (!request.file) return finish(new FileError('Nie wybrano pliku.'));
      request.file.originalname = originalName(request.file.originalname);
      finish(null, request.file);
    });
  });
}

module.exports = { upload, receive, multerError };

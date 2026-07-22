const { URL } = require('node:url');

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const crossOriginAllowed = new Set([
  'https://mediacje.polskiebudownictwo.org',
  'http://127.0.0.1:3001',
  'http://localhost:3001',
]);

function sameOrigin(request) {
  const expected = `${request.protocol}://${request.get('host')}`;
  const origin = request.get('origin');
  if (origin) return origin === expected || crossOriginAllowed.has(origin);
  const referer = request.get('referer');
  if (referer) {
    try { return new URL(referer).origin === expected; } catch { return false; }
  }
  return false;
}

function csrfProtection(request, response, next) {
  if (safeMethods.has(request.method)) return next();
  if (request.path.startsWith('/api/payments/webhook/')) return next();
  if (request.path.startsWith('/api/mediacje/') && crossOriginAllowed.has(request.get('origin'))) return next();
  if (!sameOrigin(request)) return response.status(403).json({ success: false, message: 'Nieprawidłowe źródło żądania.' });
  next();
}

module.exports = { csrfProtection };

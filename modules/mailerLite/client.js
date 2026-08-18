const { getConfig } = require('./config');

class MailerLiteApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'MailerLiteApiError';
    this.status = details.status;
    this.payload = details.payload;
  }
}

async function request(path, options = {}) {
  const config = getConfig();
  if (!config.apiToken) {
    throw new MailerLiteApiError('Brakuje MAILERLITE_API_TOKEN.');
  }

  const url = `${config.baseUrl}${path}`;
  console.log(`MailerLite API request: ${options.method || 'GET'} ${path}`);
  const response = await fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiToken}`,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => null);
  console.log(`MailerLite API response: ${response.status} ${path}`);
  if (!response.ok) {
    const message = payload?.message || `MailerLite API zwróciło HTTP ${response.status}.`;
    console.error(`MailerLite API error: ${response.status} ${path}`);
    throw new MailerLiteApiError(message, { status: response.status, payload });
  }

  return payload;
}

module.exports = {
  MailerLiteApiError,
  request,
};

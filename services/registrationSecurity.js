const TEMPORARY_DOMAINS = new Set([
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
  'temp-mail.org', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'dispostable.com', 'getnada.com', 'maildrop.cc', 'emailondeck.com',
]);

function emailDomain(email) { return String(email || '').toLowerCase().split('@').pop() || ''; }
function isBlockedEmailDomain(email) {
  const domain = emailDomain(email);
  const configured = String(process.env.BLOCKED_EMAIL_DOMAINS || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  return TEMPORARY_DOMAINS.has(domain) || configured.includes(domain);
}

async function verifyRecaptcha(token, remoteIp) {
  if (process.env.RECAPTCHA_ENABLED === '0') return { success: true, skipped: true };
  const secret = String(process.env.RECAPTCHA_SECRET_KEY || '').trim();
  const siteKey = String(process.env.RECAPTCHA_SITE_KEY || '').trim();
  if (!secret || !siteKey) return { success: process.env.NODE_ENV !== 'production', configured: false };
  if (!token) return { success: false, configured: true };
  const body = new URLSearchParams({ secret, response: String(token), remoteip: String(remoteIp || '') });
  const result = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body, signal: AbortSignal.timeout(5000) });
  if (!result.ok) return { success: false, configured: true };
  const data = await result.json();
  return { success: Boolean(data.success), configured: true };
}

function registrationConfig() {
  const enabled = process.env.RECAPTCHA_ENABLED !== '0';
  return { enabled: enabled && Boolean(process.env.RECAPTCHA_SITE_KEY), siteKey: enabled ? String(process.env.RECAPTCHA_SITE_KEY || '') : '' };
}

module.exports = { emailDomain, isBlockedEmailDomain, registrationConfig, verifyRecaptcha };

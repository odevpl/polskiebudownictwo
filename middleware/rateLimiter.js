const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Kolejne zgłoszenie możesz wysłać za chwilę.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prób logowania. Spróbuj ponownie za kilka minut.',
});

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Zbyt wiele prób rejestracji. Spróbuj ponownie później.' },
});

function emailOrIpKey(request) {
  return String(request.body?.email || ipKeyGenerator(request.ip)).trim().toLowerCase();
}

function domainOrIpKey(request) {
  return String(request.body?.email || '').split('@').pop().toLowerCase() || ipKeyGenerator(request.ip);
}

const registrationEmailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, keyGenerator: emailOrIpKey, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Dla tego adresu wykonano już zbyt wiele prób.' } });
const registrationDomainLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, keyGenerator: domainOrIpKey, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Zbyt wiele rejestracji z tej domeny.' } });
const registrationGlobalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, keyGenerator: () => 'registration-global', standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Rejestracja jest chwilowo niedostępna.' } });
const verificationResendLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, keyGenerator: emailOrIpKey, standardHeaders: true, legacyHeaders: false });

const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Wykonano zbyt wiele operacji. Spróbuj ponownie później.' },
});

module.exports = {
  loginLimiter,
  registrationDomainLimiter,
  registrationEmailLimiter,
  registrationGlobalLimiter,
  registrationLimiter,
  sensitiveActionLimiter,
  submitLimiter,
  verificationResendLimiter,
};

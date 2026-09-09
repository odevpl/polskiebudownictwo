const rateLimit = require('express-rate-limit');

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Kolejne zgloszenie mozesz wyslac za chwile.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zbyt wiele prob logowania. Sprobuj ponownie za kilka minut.',
});

const registrationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 3, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Zbyt wiele prób rejestracji. Spróbuj ponownie później.' } });
const registrationEmailLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, keyGenerator: request => String(request.body?.email || request.ip).trim().toLowerCase(), standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Dla tego adresu wykonano już zbyt wiele prób.' } });
const registrationDomainLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, keyGenerator: request => String(request.body?.email || '').split('@').pop().toLowerCase() || request.ip, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Zbyt wiele rejestracji z tej domeny.' } });
const registrationGlobalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, keyGenerator: () => 'registration-global', standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Rejestracja jest chwilowo niedostępna.' } });
const verificationResendLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, keyGenerator: request => String(request.body?.email || request.ip).trim().toLowerCase(), standardHeaders: true, legacyHeaders: false });

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

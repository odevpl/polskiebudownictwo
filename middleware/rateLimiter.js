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

module.exports = {
  loginLimiter,
  submitLimiter,
};

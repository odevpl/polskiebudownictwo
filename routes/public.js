const express = require('express');
const submitController = require('../controllers/public/submitController');
const { submitLimiter } = require('../middleware/rateLimiter');
const { submitValidation } = require('../middleware/validate');

const router = express.Router();

router.post('/api/submit', submitLimiter, submitValidation, submitController.store);

router.post('/send-contact.php', (request, response) => {
  const required = [
    'name',
    'company',
    'email',
    'role[]',
    'company-size',
    'consent-service',
    'consent-marketing',
    'form-started',
  ];

  const missing = required.some(field => {
    const value = request.body[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });

  if (missing) {
    response.status(422).json({
      success: false,
      message: 'Uzupelnij wszystkie wymagane pola.',
    });
    return;
  }

  console.log('[test] Zgloszenie zaakceptowane bez wysylania e-maila.');
  response.json({
    success: true,
    message: 'Zgloszenie zostalo wyslane w trybie testowym.',
  });
});

module.exports = router;

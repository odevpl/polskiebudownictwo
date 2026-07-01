const express = require('express');
const submitController = require('../controllers/public/submitController');
const { submitLimiter } = require('../middleware/rateLimiter');
const { submitValidation } = require('../middleware/validate');

const router = express.Router();

router.post('/api/submit', submitLimiter, submitValidation, submitController.store);

module.exports = router;

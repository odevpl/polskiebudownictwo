const express = require('express');
const mediationController = require('../controllers/public/mediationController');
const mediatorController = require('../controllers/public/mediatorController');
const submitController = require('../controllers/public/submitController');
const youtubeController = require('../controllers/public/youtubeController');
const { submitLimiter } = require('../middleware/rateLimiter');
const { mediationCaseValidation, mediatorApplicationValidation, submitValidation } = require('../middleware/validate');

const router = express.Router();

router.post('/api/submit', submitLimiter, submitValidation, submitController.store);
router.post('/api/mediacje/zgloszenie', submitLimiter, mediationCaseValidation, mediationController.submitCase);
router.post('/api/mediacje/zostan-mediatorem', submitLimiter, mediatorApplicationValidation, mediatorController.submitApplication);
router.get('/youtube/:videoId', youtubeController.show);

module.exports = router;

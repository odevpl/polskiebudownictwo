const express = require('express');
const mediationController = require('../controllers/public/mediationController');
const mediatorController = require('../controllers/public/mediatorController');
const submitController = require('../controllers/public/submitController');
const authController = require('../controllers/public/authController');
const youtubeController = require('../controllers/public/youtubeController');
const { submitLimiter } = require('../middleware/rateLimiter');
const { loginValidation, mediationCaseValidation, mediatorApplicationValidation, passwordChangeValidation, registrationValidation, resetValidation, submitValidation } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/api/submit', submitLimiter, submitValidation, submitController.store);
router.post('/api/auth/register', loginLimiter, registrationValidation, authController.register);
router.post('/api/auth/login', loginLimiter, loginValidation, authController.login);
router.post('/api/auth/logout', authController.logout);
router.get('/api/auth/session', authController.sessionInfo);
router.post('/api/auth/verify-email', loginLimiter, authController.verifyEmail);
router.post('/api/auth/password-reset', loginLimiter, resetValidation, authController.requestPasswordReset);
router.post('/api/auth/password-reset/confirm', loginLimiter, passwordChangeValidation, authController.resetPassword);
router.post('/api/mediacje/zgloszenie', submitLimiter, mediationCaseValidation, mediationController.submitCase);
router.post('/api/mediacje/zostan-mediatorem', submitLimiter, mediatorApplicationValidation, mediatorController.submitApplication);
router.get('/youtube/:videoId', youtubeController.show);

module.exports = router;

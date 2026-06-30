const express = require('express');
const authController = require('../controllers/admin/authController');
const submissionsController = require('../controllers/admin/submissionsController');
const { adminUrl } = require('../config/adminPath');
const { requireAuth } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/login', authController.showLogin);
router.post('/login', loginLimiter, authController.login);
router.post('/logout', requireAuth, authController.logout);
router.get('/', requireAuth, (request, response) => response.redirect(adminUrl('/submissions')));
router.get('/submissions', requireAuth, submissionsController.index);
router.get('/submissions/:id', requireAuth, submissionsController.show);

module.exports = router;

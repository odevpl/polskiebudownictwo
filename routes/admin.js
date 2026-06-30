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
router.post('/submissions/export', requireAuth, submissionsController.exportCsv);
router.get('/submissions/new', requireAuth, submissionsController.newForm);
router.post('/submissions/new', requireAuth, submissionsController.create);
router.get('/submissions/:id/edit', requireAuth, submissionsController.editForm);
router.post('/submissions/:id/edit', requireAuth, submissionsController.update);
router.post('/submissions/:id/delete', requireAuth, submissionsController.destroy);
router.get('/submissions/:id', requireAuth, submissionsController.redirectToEdit);

module.exports = router;

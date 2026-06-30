const { adminUrl } = require('../config/adminPath');

function requireAuth(request, response, next) {
  if (request.session?.admin) {
    next();
    return;
  }

  response.redirect(adminUrl('/login'));
}

function requireGuest(request, response, next) {
  if (request.session?.admin) {
    response.redirect(adminUrl('/submissions'));
    return;
  }

  next();
}

module.exports = {
  requireAuth,
  requireGuest,
};

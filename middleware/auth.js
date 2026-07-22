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

function requireRole(...roles) {
  return (request, response, next) => {
    if (request.session?.admin && roles.includes(request.session.admin.role)) {
      next();
      return;
    }
    response.status(403).send('Brak uprawnień.');
  };
}

module.exports = { requireAuth, requireGuest, requireRole };

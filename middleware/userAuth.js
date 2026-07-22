function requireUser(request, response, next) {
  if (request.session?.user) {
    next();
    return;
  }
  response.redirect('/logowanie.html');
}

function requireUserApi(request, response, next) {
  if (request.session?.user) {
    next();
    return;
  }

  response.status(401).json({ success: false, message: 'Wymagane jest zalogowanie.' });
}

module.exports = { requireUser, requireUserApi };

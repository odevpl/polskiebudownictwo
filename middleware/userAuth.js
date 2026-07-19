function requireUser(request, response, next) {
  if (request.session?.user) {
    next();
    return;
  }
  response.redirect('/logowanie.html');
}

module.exports = { requireUser };

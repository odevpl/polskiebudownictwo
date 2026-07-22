const User = require('../models/User');

async function activeUser(request) {
  if (!request.session?.user?.id) return null;
  const user = await User.findById(request.session.user.id);
  return user && user.is_active ? user : null;
}

async function requireUser(request, response, next) {
  try {
    if (await activeUser(request)) {
      next();
      return;
    }
    response.redirect('/logowanie.html');
  } catch (error) {
    console.error('User authorization error:', error);
    response.status(500).send('Nie udało się zweryfikować sesji.');
  }
}

async function requireUserApi(request, response, next) {
  try {
    response.setHeader('Cache-Control', 'no-store');
    if (await activeUser(request)) {
      next();
      return;
    }
    response.status(401).json({ success: false, message: 'Wymagane jest zalogowanie.' });
  } catch (error) {
    console.error('User API authorization error:', error);
    response.status(500).json({ success: false, message: 'Nie udało się zweryfikować sesji.' });
  }
}

module.exports = { requireUser, requireUserApi };

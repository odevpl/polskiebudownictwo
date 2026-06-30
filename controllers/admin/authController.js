const bcrypt = require('bcrypt');
const Admin = require('../../models/Admin');
const { adminUrl } = require('../../config/adminPath');

function showLogin(request, response) {
  if (request.session?.admin) {
    response.redirect(adminUrl('/submissions'));
    return;
  }

  response.render('admin/login', {
    title: 'Logowanie',
    error: null,
    values: {},
  });
}

async function login(request, response) {
  const email = String(request.body.email || '').trim().toLowerCase();
  const password = String(request.body.password || '');

  try {
    const admin = await Admin.findByEmail(email);
    const passwordMatches = admin ? await bcrypt.compare(password, admin.password_hash) : false;

    if (!admin || !passwordMatches || !admin.is_active) {
      response.status(401).render('admin/login', {
        title: 'Logowanie',
        error: 'Nieprawidlowy e-mail lub haslo.',
        values: { email },
      });
      return;
    }

    request.session.admin = {
      id: admin.id,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role,
    };

    await Admin.touchLogin(admin.id);
    response.redirect(adminUrl('/submissions'));
  } catch (error) {
    console.error('Login error:', error);
    response.status(500).render('admin/login', {
      title: 'Logowanie',
      error: 'Panel admina wymaga skonfigurowanej bazy danych.',
      values: { email },
    });
  }
}

function logout(request, response) {
  request.session.destroy(() => {
    response.clearCookie('pb.sid');
    response.redirect(adminUrl('/login'));
  });
}

module.exports = {
  login,
  logout,
  showLogin,
};

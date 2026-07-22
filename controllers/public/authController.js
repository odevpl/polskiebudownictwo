const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../../models/User');
const UserToken = require('../../models/UserToken');
const { sendAccountVerificationEmail, sendPasswordResetEmail } = require('../../services/mailService');

const genericResetMessage = 'Jeśli konto dla tego adresu istnieje, wysłaliśmy wiadomość z instrukcją resetu hasła.';

function publicUrl(request) {
  return process.env.PUBLIC_BASE_URL || `${request.protocol}://${request.get('host')}`;
}

function validationFailure(request, response) {
  const errors = validationResult(request);
  if (errors.isEmpty()) return false;
  response.status(422).json({ success: false, message: errors.array()[0].msg });
  return true;
}

function establishSession(request, user, callback) {
  request.session.regenerate(error => {
    if (error) {
      callback(error);
      return;
    }
    request.session.user = { id: user.id, email: user.email };
    callback(null);
  });
}

async function register(request, response) {
  if (validationFailure(request, response)) return;
  const email = request.body.email.trim().toLowerCase();
  try {
    if (await User.findByEmail(email)) {
      response.status(409).json({ success: false, message: 'Konto dla tego adresu już istnieje.' });
      return;
    }
    const user = await User.create({ email, passwordHash: await bcrypt.hash(request.body.password, 12) });
    const token = await UserToken.create(user.id, 'email_verification');
    await sendAccountVerificationEmail(user.email, `${publicUrl(request)}/weryfikacja-email.html?token=${encodeURIComponent(token)}`);
    response.status(201).json({ success: true, message: 'Konto utworzone. Sprawdź skrzynkę e-mail, aby potwierdzić adres.' });
  } catch (error) {
    console.error('Registration error:', error);
    response.status(500).json({ success: false, message: 'Nie udało się utworzyć konta. Spróbuj ponownie później.' });
  }
}

async function verifyEmail(request, response) {
  const token = String(request.body.token || '');
  try {
    const record = await UserToken.consume(token, 'email_verification');
    if (!record) return response.status(400).json({ success: false, message: 'Link weryfikacyjny jest nieprawidłowy lub wygasł.' });
    await User.verifyEmail(record.user_id);
    return response.json({ success: true, message: 'Adres e-mail został potwierdzony. Możesz się zalogować.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się potwierdzić adresu e-mail.' });
  }
}

async function login(request, response) {
  if (validationFailure(request, response)) return;
  const email = request.body.email.trim().toLowerCase();
  try {
    const user = await User.findByEmail(email);
    if (!user || !user.is_active || !await bcrypt.compare(request.body.password, user.password_hash)) {
      return response.status(401).json({ success: false, message: 'Nieprawidłowy e-mail lub hasło.' });
    }
    if (!user.email_verified_at) return response.status(403).json({ success: false, message: 'Najpierw potwierdź adres e-mail.' });
    establishSession(request, user, async sessionError => {
      if (sessionError) return response.status(500).json({ success: false, message: 'Nie udało się zapisać sesji.' });
      await User.touchLogin(user.id);
      return request.session.save(error => error ? response.status(500).json({ success: false, message: 'Nie udało się zapisać sesji.' }) : response.json({ success: true, message: 'Zalogowano.', redirect: '/akademia' }));
    });
    return;
  } catch (error) {
    console.error('User login error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się zalogować.' });
  }
}

async function requestPasswordReset(request, response) {
  if (validationFailure(request, response)) return;
  try {
    const user = await User.findByEmail(request.body.email.trim().toLowerCase());
    if (user && user.is_active) {
      const token = await UserToken.create(user.id, 'password_reset');
      await sendPasswordResetEmail(user.email, `${publicUrl(request)}/reset-hasla.html?token=${encodeURIComponent(token)}`);
    }
    return response.json({ success: true, message: genericResetMessage });
  } catch (error) {
    console.error('Password reset request error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się wysłać wiadomości.' });
  }
}

async function resetPassword(request, response) {
  if (validationFailure(request, response)) return;
  try {
    const record = await UserToken.consume(request.body.token, 'password_reset');
    if (!record) return response.status(400).json({ success: false, message: 'Link resetu hasła jest nieprawidłowy lub wygasł.' });
    await User.updatePassword(record.user_id, await bcrypt.hash(request.body.password, 12));
    return response.json({ success: true, message: 'Hasło zostało zmienione. Możesz się zalogować.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się zmienić hasła.' });
  }
}

function logout(request, response) {
  request.session.destroy(() => { response.clearCookie('pb.sid'); response.json({ success: true }); });
}

function sessionInfo(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.json({
    authenticated: Boolean(request.session?.user),
    user: request.session?.user ? { email: request.session.user.email } : null,
  });
}

module.exports = { login, logout, register, requestPasswordReset, resetPassword, sessionInfo, verifyEmail };

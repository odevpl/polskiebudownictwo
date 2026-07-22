const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const User = require('../../models/User');
const UserProfile = require('../../models/UserProfile');
const UserBilling = require('../../models/UserBilling');

function validationFailure(request, response) {
  const errors = validationResult(request);
  if (errors.isEmpty()) return false;
  response.status(422).json({ success: false, message: errors.array()[0].msg });
  return true;
}

function value(value) {
  return String(value || '').trim();
}

async function getAccount(request, response) {
  try {
    const user = await User.findById(request.session.user.id);
    if (!user) return response.status(401).json({ success: false, message: 'Sesja jest nieaktualna.' });
    const [profile, billing] = await Promise.all([
      UserProfile.findByUserId(user.id),
      UserBilling.findByUserId(user.id),
    ]);

    return response.json({
      success: true,
      account: {
        email: user.email,
        emailVerified: Boolean(user.email_verified_at),
        profile: {
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          phone: profile.phone || '',
        },
        billing: {
          billingType: billing.billing_type,
          companyName: billing.company_name || '',
          nip: billing.nip || '',
          billingEmail: billing.billing_email || '',
          street: billing.street || '',
          buildingNumber: billing.building_number || '',
          apartmentNumber: billing.apartment_number || '',
          postalCode: billing.postal_code || '',
          city: billing.city || '',
          country: billing.country || 'Polska',
        },
      },
    });
  } catch (error) {
    console.error('Account read error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się pobrać danych konta.' });
  }
}

async function updateProfile(request, response) {
  if (validationFailure(request, response)) return;
  try {
    await UserProfile.upsert(request.session.user.id, {
      firstName: value(request.body.firstName),
      lastName: value(request.body.lastName),
      phone: value(request.body.phone),
    });
    return response.json({ success: true, message: 'Dane kontaktowe zostały zapisane.' });
  } catch (error) {
    console.error('Account profile update error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się zapisać danych kontaktowych.' });
  }
}

async function updateBilling(request, response) {
  if (validationFailure(request, response)) return;
  try {
    const nip = value(request.body.nip).replace(/[-\s]/g, '');
    await UserBilling.upsert(request.session.user.id, {
      billingType: request.body.billingType,
      companyName: value(request.body.companyName),
      nip,
      billingEmail: value(request.body.billingEmail),
      street: value(request.body.street),
      buildingNumber: value(request.body.buildingNumber),
      apartmentNumber: value(request.body.apartmentNumber),
      postalCode: value(request.body.postalCode),
      city: value(request.body.city),
      country: value(request.body.country) || 'Polska',
    });
    return response.json({ success: true, message: 'Dane do faktury zostały zapisane.' });
  } catch (error) {
    console.error('Account billing update error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się zapisać danych do faktury.' });
  }
}

async function changePassword(request, response) {
  if (validationFailure(request, response)) return;
  try {
    const user = await User.findById(request.session.user.id);
    if (!user || !await bcrypt.compare(request.body.currentPassword, user.password_hash)) {
      return response.status(400).json({ success: false, message: 'Aktualne hasło jest nieprawidłowe.' });
    }
    await User.updatePassword(user.id, await bcrypt.hash(request.body.newPassword, 12));
    return response.json({ success: true, message: 'Hasło zostało zmienione.' });
  } catch (error) {
    console.error('Account password update error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się zmienić hasła.' });
  }
}

module.exports = { changePassword, getAccount, updateBilling, updateProfile };

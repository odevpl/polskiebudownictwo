require('dotenv').config({ quiet: true });

const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const pool = require('../config/database');

async function createSuperadmin() {
  const [, , emailArg, passwordArg, ...nameParts] = process.argv;
  const email = String(emailArg || '').trim().toLowerCase();
  const password = String(passwordArg || '');
  const fullName = nameParts.join(' ') || 'Superadmin';

  if (!email || !password) {
    console.error('Uzycie: node scripts/createSuperadmin.js email@example.com haslo "Imie Nazwisko"');
    process.exitCode = 1;
    return;
  }

  const existing = await Admin.findByEmail(email);
  if (existing) {
    console.error('Konto o tym adresie e-mail juz istnieje.');
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({
    email,
    passwordHash,
    fullName,
    role: 'superadmin',
  });

  console.log(`Utworzono superadmina: ${admin.email}`);
}

createSuperadmin()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

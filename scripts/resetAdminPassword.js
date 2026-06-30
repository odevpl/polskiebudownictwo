require('dotenv').config({ quiet: true });

const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function resetAdminPassword() {
  const [, , emailArg, passwordArg] = process.argv;
  const email = String(emailArg || '').trim().toLowerCase();
  const password = String(passwordArg || '');

  if (!email || !password) {
    console.error('Uzycie: node scripts/resetAdminPassword.js email@example.com nowe_haslo');
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    'UPDATE admins SET password_hash = ? WHERE email = ?',
    [passwordHash, email],
  );

  if (result.affectedRows === 0) {
    console.error('Nie znaleziono admina o podanym adresie e-mail.');
    process.exitCode = 1;
    return;
  }

  console.log(`Zresetowano haslo admina: ${email}`);
}

resetAdminPassword()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

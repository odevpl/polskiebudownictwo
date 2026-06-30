const pool = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM admins WHERE email = ? LIMIT 1',
    [email],
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO admins (email, password_hash, full_name, role, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.email,
      data.passwordHash,
      data.fullName,
      data.role || 'admin',
      data.createdBy || null,
    ],
  );

  return {
    id: result.insertId,
    ...data,
  };
}

async function touchLogin(id) {
  await pool.execute(
    'UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
    [id],
  );
}

module.exports = {
  create,
  findByEmail,
  touchLogin,
};

const pool = require('../config/database');

async function findByEmail(email) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create({ email, passwordHash }) {
  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash],
  );
  return findById(result.insertId);
}

async function verifyEmail(id) {
  await pool.execute('UPDATE users SET email_verified_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
}

async function updatePassword(id, passwordHash) {
  await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
}

async function touchLogin(id) {
  await pool.execute('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
}

async function findAcademyUsers(search = '') {
  const term = `%${String(search).trim()}%`;
  const [rows] = await pool.execute(
    `SELECT id, email, is_active, email_verified_at
     FROM users
     WHERE email LIKE ?
     ORDER BY email ASC
     LIMIT 100`,
    [term],
  );
  return rows;
}

async function findAcademySummary(search = '') {
  const term = `%${String(search).trim()}%`;
  const [rows] = await pool.execute(
    `SELECT u.id, u.email, u.is_active, u.email_verified_at,
            p.first_name, p.last_name, p.phone,
            b.billing_type, b.company_name, b.nip, b.billing_email,
            COUNT(DISTINCT a.id) AS access_count,
            COUNT(DISTINCT CASE WHEN a.status = 'active' THEN a.id END) AS active_access_count,
            COUNT(DISTINCT CASE WHEN lp.completed_at IS NOT NULL THEN CONCAT(lp.user_id, ':', lp.lesson_id) END) AS completed_lesson_count
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     LEFT JOIN user_billing_details b ON b.user_id = u.id
     LEFT JOIN user_course_access a ON a.user_id = u.id
     LEFT JOIN user_lesson_progress lp ON lp.user_id = u.id
     WHERE u.email LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR b.nip LIKE ?
     GROUP BY u.id, u.email, u.is_active, u.email_verified_at, p.first_name, p.last_name, p.phone,
              b.billing_type, b.company_name, b.nip, b.billing_email
     ORDER BY u.created_at DESC
     LIMIT 100`,
    [term, term, term, term],
  );
  return rows;
}

async function deactivate(id) {
  const [result] = await pool.execute('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, deactivate, findAcademySummary, findAcademyUsers, findByEmail, findById, touchLogin, updatePassword, verifyEmail };

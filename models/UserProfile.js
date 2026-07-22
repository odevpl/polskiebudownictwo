const pool = require('../config/database');

async function findByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT first_name, last_name, phone
     FROM user_profiles
     WHERE user_id = ?
     LIMIT 1`,
    [userId],
  );
  return rows[0] || { first_name: '', last_name: '', phone: '' };
}

async function upsert(userId, data) {
  await pool.execute(
    `INSERT INTO user_profiles (user_id, first_name, last_name, phone)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       first_name = VALUES(first_name),
       last_name = VALUES(last_name),
       phone = VALUES(phone)`,
    [userId, data.firstName || null, data.lastName || null, data.phone || null],
  );
}

module.exports = { findByUserId, upsert };

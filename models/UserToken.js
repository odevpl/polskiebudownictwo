const crypto = require('node:crypto');
const pool = require('../config/database');

const TOKEN_TTL_MINUTES = {
  email_verification: 24 * 60,
  password_reset: 60,
};

function hash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function create(userId, type) {
  const token = crypto.randomBytes(32).toString('base64url');
  const ttl = TOKEN_TTL_MINUTES[type];
  if (!ttl) throw new Error('Unsupported user token type.');

  await pool.execute('DELETE FROM user_tokens WHERE user_id = ? AND type = ?', [userId, type]);
  await pool.execute(
    `INSERT INTO user_tokens (user_id, token_hash, type, expires_at)
     VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL ? MINUTE))`,
    [userId, hash(token), type, ttl],
  );
  return token;
}

async function consume(token, type) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT * FROM user_tokens
       WHERE token_hash = ? AND type = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
       LIMIT 1 FOR UPDATE`,
      [hash(token), type],
    );
    const record = rows[0];
    if (!record) {
      await connection.rollback();
      return null;
    }
    await connection.execute('UPDATE user_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [record.id]);
    await connection.commit();
    return record;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { consume, create };

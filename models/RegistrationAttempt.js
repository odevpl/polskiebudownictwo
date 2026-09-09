const pool = require('../config/database');

async function create({ email = null, ipAddress = null, userAgent = null, status, reason = null }) {
  await pool.execute(
    `INSERT INTO registration_attempts (email, ip_address, user_agent, status, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [email, ipAddress, String(userAgent || '').slice(0, 500) || null, status, reason],
  );
}

module.exports = { create };

const crypto = require('node:crypto');
const pool = require('../config/database');

async function exportForUser(userId) {
  const [userRows] = await pool.execute(
    `SELECT id, email, email_verified_at, is_active, created_at, updated_at, anonymized_at
     FROM users WHERE id = ? LIMIT 1`,
    [userId],
  );
  if (!userRows[0]) return null;
  const [profileRows, billingRows, accessRows, progressRows, orderRows, submissionRows] = await Promise.all([
    pool.execute('SELECT first_name, last_name, phone, created_at, updated_at FROM user_profiles WHERE user_id = ?', [userId]),
    pool.execute('SELECT billing_type, company_name, nip, billing_email, street, building_number, apartment_number, postal_code, city, country, created_at, updated_at FROM user_billing_details WHERE user_id = ?', [userId]),
    pool.execute(`SELECT a.access_type, a.status, a.granted_at, a.expires_at, a.revoked_at, a.revoked_reason, c.slug AS course_slug, c.title AS course_title FROM user_course_access a INNER JOIN courses c ON c.id = a.course_id WHERE a.user_id = ?`, [userId]),
    pool.execute(`SELECT p.started_at, p.completed_at, p.last_viewed_at, l.slug AS lesson_slug, l.title AS lesson_title, c.slug AS course_slug FROM user_lesson_progress p INNER JOIN course_lessons l ON l.id = p.lesson_id INNER JOIN courses c ON c.id = l.course_id WHERE p.user_id = ?`, [userId]),
    pool.execute(`SELECT o.order_number, o.status, o.currency, o.total_amount, o.billing_snapshot, o.payment_provider, o.provider_payment_id, o.paid_at, o.created_at, i.status AS invoice_status, i.invoice_number FROM orders o LEFT JOIN invoices i ON i.order_id = o.id WHERE o.user_id = ? ORDER BY o.created_at DESC`, [userId]),
    pool.execute(`SELECT id, first_name, last_name, company_name, email, phone, roles, \`groups\`, company_size, consent_data, consent_marketing, created_at, updated_at, status, status_tags FROM submissions WHERE email = (SELECT email FROM users WHERE id = ?)`, [userId]),
  ]);
  return {
    exportedAt: new Date().toISOString(), account: userRows[0], profile: profileRows[0][0] || null,
    billing: billingRows[0][0] || null, courseAccess: accessRows[0], lessonProgress: progressRows[0],
    orders: orderRows[0].map(row => ({ ...row, billing_snapshot: parseJson(row.billing_snapshot) })),
    submissions: submissionRows[0].map(parseJsonColumns),
  };
}

async function anonymizeUser(userId, passwordHash) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [userRows] = await connection.execute('SELECT id, email FROM users WHERE id = ? LIMIT 1 FOR UPDATE', [userId]);
    const user = userRows[0];
    if (!user) {
      await connection.rollback();
      return false;
    }
    const anonymizedEmail = `deleted-${userId}-${crypto.randomBytes(5).toString('hex')}@invalid.local`;
    await connection.execute(`UPDATE users SET email = ?, password_hash = ?, email_verified_at = NULL, is_active = 0, anonymized_at = CURRENT_TIMESTAMP WHERE id = ?`, [anonymizedEmail, passwordHash, userId]);
    await connection.execute('UPDATE user_profiles SET first_name = NULL, last_name = NULL, phone = NULL WHERE user_id = ?', [userId]);
    await connection.execute(`UPDATE user_billing_details SET company_name = NULL, nip = NULL, billing_email = NULL, street = NULL, building_number = NULL, apartment_number = NULL, postal_code = NULL, city = NULL WHERE user_id = ?`, [userId]);
    await connection.execute(`UPDATE submissions SET first_name = NULL, last_name = NULL, company_name = NULL, email = ?, phone = NULL, ip_address = NULL, notes = NULL WHERE email = ?`, [anonymizedEmail, user.email]);
    await connection.execute('DELETE FROM user_tokens WHERE user_id = ?', [userId]);
    await connection.execute(`UPDATE orders SET billing_snapshot = JSON_OBJECT('anonymized', true) WHERE user_id = ? AND status IN ('pending', 'cancelled', 'refunded')`, [userId]);
    await connection.execute(`UPDATE invoices i INNER JOIN orders o ON o.id = i.order_id SET i.billing_snapshot = JSON_OBJECT('anonymized', true) WHERE o.user_id = ? AND o.status IN ('pending', 'cancelled', 'refunded')`, [userId]);
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

function parseJson(value) {
  if (value && typeof value === 'object') return value;
  try { return JSON.parse(value || '{}'); } catch { return {}; }
}
function parseJsonColumns(row) { return { ...row, roles: parseJson(row.roles), groups: parseJson(row.groups), status_tags: parseJson(row.status_tags) }; }

module.exports = { anonymizeUser, exportForUser };

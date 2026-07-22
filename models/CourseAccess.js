const pool = require('../config/database');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT a.*, u.email, c.title AS course_title, c.slug AS course_slug
     FROM user_course_access a
     INNER JOIN users u ON u.id = a.user_id
     INNER JOIN courses c ON c.id = a.course_id
     ORDER BY a.created_at DESC, a.id DESC`,
  );
  return rows;
}

async function findAudit() {
  const [rows] = await pool.query(
    `SELECT h.*, u.email, c.title AS course_title, a.full_name AS admin_name
     FROM academy_access_audit h
     INNER JOIN users u ON u.id = h.user_id
     INNER JOIN courses c ON c.id = h.course_id
     LEFT JOIN admins a ON a.id = h.admin_id
     ORDER BY h.created_at DESC, h.id DESC
     LIMIT 200`,
  );
  return rows;
}

async function findByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT a.*, c.slug AS course_slug, c.title AS course_title
     FROM user_course_access a
     INNER JOIN courses c ON c.id = a.course_id
     WHERE a.user_id = ?
     ORDER BY a.granted_at DESC, a.id DESC`,
    [userId],
  );
  return rows;
}

async function findByUserAndCourse(userId, courseId) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM user_course_access
     WHERE user_id = ? AND course_id = ?
     LIMIT 1`,
    [userId, courseId],
  );
  return rows[0] || null;
}

async function hasActiveAccess(userId, courseId) {
  const [rows] = await pool.execute(
    `SELECT 1
     FROM user_course_access
     WHERE user_id = ?
       AND course_id = ?
       AND status = 'active'
       AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
     LIMIT 1`,
    [userId, courseId],
  );
  return rows.length > 0;
}

async function grant(userId, courseId, data = {}) {
  await pool.execute(
    `INSERT INTO user_course_access
       (user_id, course_id, access_type, status, expires_at, granted_by_admin_id, source_reference)
     VALUES (?, ?, ?, 'active', ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       access_type = VALUES(access_type),
       status = 'active',
       expires_at = VALUES(expires_at),
       revoked_at = NULL,
       revoked_reason = NULL,
       granted_by_admin_id = VALUES(granted_by_admin_id),
       source_reference = VALUES(source_reference)`,
    [
      userId,
      courseId,
      data.accessType || 'grant',
      data.expiresAt || null,
      data.grantedByAdminId || null,
      data.sourceReference || null,
    ],
  );
  const access = await findByUserAndCourse(userId, courseId);
  await pool.execute(
    `INSERT INTO academy_access_audit (access_id, user_id, course_id, admin_id, action, reason)
     VALUES (?, ?, ?, ?, 'grant', ?)`,
    [access.id, userId, courseId, data.grantedByAdminId || null, data.reason || null],
  );
  return access;
}

async function revoke(userId, courseId, reason = null, adminId = null) {
  const access = await findByUserAndCourse(userId, courseId);
  const [result] = await pool.execute(
    `UPDATE user_course_access
     SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP, revoked_reason = ?
     WHERE user_id = ? AND course_id = ?`,
    [reason, userId, courseId],
  );
  if (result.affectedRows > 0 && access) {
    await pool.execute(
      `INSERT INTO academy_access_audit (access_id, user_id, course_id, admin_id, action, reason)
       VALUES (?, ?, ?, ?, 'revoke', ?)`,
      [access.id, userId, courseId, adminId, reason],
    );
  }
  return result.affectedRows > 0;
}

module.exports = { findAll, findAudit, findByUserId, findByUserAndCourse, grant, hasActiveAccess, revoke };

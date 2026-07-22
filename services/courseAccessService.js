const pool = require('../config/database');

async function hasActiveAccess(userId, courseId) {
  const [rows] = await pool.execute(
    `SELECT 1
     FROM courses c
     LEFT JOIN user_course_access a
       ON a.course_id = c.id
      AND a.user_id = ?
      AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
     WHERE c.id = ?
       AND c.is_active = 1
       AND (c.is_free = 1 OR a.id IS NOT NULL)
     LIMIT 1`,
    [userId, courseId],
  );
  return rows.length > 0;
}

async function findAvailableCourses(userId) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.slug, c.title, c.description, c.category, c.level,
            c.lesson_count, c.is_free, c.sort_order
     FROM courses c
     LEFT JOIN user_course_access a
       ON a.course_id = c.id
      AND a.user_id = ?
      AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
     WHERE c.is_active = 1
       AND (c.is_free = 1 OR a.id IS NOT NULL)
     ORDER BY c.sort_order ASC, c.id ASC`,
    [userId],
  );
  return rows;
}

module.exports = { findAvailableCourses, hasActiveAccess };

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
            c.price_amount, c.currency, c.lesson_count, c.is_free, c.sort_order,
            1 AS has_access
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

async function findCatalogCourses(userId) {
  const [rows] = await pool.execute(
    `SELECT c.id, c.slug, c.title, c.description, c.category, c.level,
            c.price_amount, c.currency, c.lesson_count, c.is_free, c.sort_order,
            CASE WHEN c.is_free = 1 OR a.id IS NOT NULL THEN 1 ELSE 0 END AS has_access
     FROM courses c
     LEFT JOIN user_course_access a
       ON a.course_id = c.id
      AND a.user_id = ?
      AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
     WHERE c.is_active = 1
     ORDER BY c.sort_order ASC, c.id ASC`,
    [userId],
  );
  return rows;
}

async function hasLessonAccess(userId, lessonId) {
  const [rows] = await pool.execute(
    `SELECT 1
     FROM course_lessons l
     INNER JOIN courses c ON c.id = l.course_id
     LEFT JOIN user_course_access a
       ON a.course_id = c.id
      AND a.user_id = ?
      AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > CURRENT_TIMESTAMP)
     WHERE l.id = ?
       AND l.is_published = 1
       AND c.is_active = 1
       AND (c.is_free = 1 OR a.id IS NOT NULL)
     LIMIT 1`,
    [userId, lessonId],
  );
  return rows.length > 0;
}

module.exports = { findAvailableCourses, findCatalogCourses, hasActiveAccess, hasLessonAccess };

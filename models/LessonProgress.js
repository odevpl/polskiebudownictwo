const pool = require('../config/database');

async function findByUserAndLesson(userId, lessonId) {
  const [rows] = await pool.execute(
    `SELECT *
     FROM user_lesson_progress
     WHERE user_id = ? AND lesson_id = ?
     LIMIT 1`,
    [userId, lessonId],
  );
  return rows[0] || null;
}

async function findByUserAndCourse(userId, courseId) {
  const [rows] = await pool.execute(
    `SELECT p.*
     FROM user_lesson_progress p
     INNER JOIN course_lessons l ON l.id = p.lesson_id
     WHERE p.user_id = ? AND l.course_id = ?
     ORDER BY l.sort_order ASC, l.id ASC`,
    [userId, courseId],
  );
  return rows;
}

async function markViewed(userId, lessonId) {
  await pool.execute(
    `INSERT INTO user_lesson_progress (user_id, lesson_id, started_at, last_viewed_at)
     VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
       last_viewed_at = CURRENT_TIMESTAMP`,
    [userId, lessonId],
  );
  return findByUserAndLesson(userId, lessonId);
}

async function markCompleted(userId, lessonId) {
  await pool.execute(
    `INSERT INTO user_lesson_progress
       (user_id, lesson_id, started_at, completed_at, last_viewed_at)
     VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE
       started_at = COALESCE(started_at, CURRENT_TIMESTAMP),
       completed_at = CURRENT_TIMESTAMP,
       last_viewed_at = CURRENT_TIMESTAMP`,
    [userId, lessonId],
  );
  return findByUserAndLesson(userId, lessonId);
}

module.exports = { findByUserAndCourse, findByUserAndLesson, markCompleted, markViewed };

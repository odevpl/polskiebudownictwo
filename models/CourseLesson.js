const pool = require('../config/database');

async function findByCourseId(courseId, { publishedOnly = false } = {}) {
  const where = publishedOnly ? 'AND is_published = 1' : '';
  const [rows] = await pool.execute(
    `SELECT id, course_id, slug, title, description, content_type, content,
            sort_order, is_published, created_at, updated_at
     FROM course_lessons
     WHERE course_id = ? ${where}
     ORDER BY sort_order ASC, id ASC`,
    [courseId],
  );
  return rows;
}

async function findBySlug(courseId, slug, { publishedOnly = false } = {}) {
  const publishedCondition = publishedOnly ? 'AND is_published = 1' : '';
  const [rows] = await pool.execute(
    `SELECT *
     FROM course_lessons
     WHERE course_id = ? AND slug = ? ${publishedCondition}
     LIMIT 1`,
    [courseId, slug],
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO course_lessons
       (course_id, slug, title, description, content_type, content, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.courseId,
      data.slug,
      data.title,
      data.description || null,
      data.contentType || 'text',
      data.content || null,
      data.sortOrder || 0,
      data.isPublished ? 1 : 0,
    ],
  );
  return findBySlug(data.courseId, data.slug);
}

module.exports = { create, findByCourseId, findBySlug };

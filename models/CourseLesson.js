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

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM course_lessons WHERE id = ? LIMIT 1', [id]);
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
  await syncLessonCount(data.courseId);
  return findBySlug(data.courseId, data.slug);
}

async function update(id, data) {
  await pool.execute(
    `UPDATE course_lessons
     SET slug = ?, title = ?, description = ?, content_type = ?, content = ?, sort_order = ?, is_published = ?
     WHERE id = ?`,
    [data.slug, data.title, data.description || null, data.contentType || 'text', data.content || null, data.sortOrder || 0, data.isPublished ? 1 : 0, id],
  );
  return findById(id);
}

async function remove(id) {
  const lesson = await findById(id);
  if (!lesson) return false;
  const [result] = await pool.execute('DELETE FROM course_lessons WHERE id = ?', [id]);
  await syncLessonCount(lesson.course_id);
  return result.affectedRows > 0;
}

async function syncLessonCount(courseId) {
  await pool.execute(
    `UPDATE courses c
     SET lesson_count = (SELECT COUNT(*) FROM course_lessons l WHERE l.course_id = c.id)
     WHERE c.id = ?`,
    [courseId],
  );
}

module.exports = { create, findByCourseId, findById, findBySlug, remove, syncLessonCount, update };

const pool = require('../config/database');

async function findByCourseId(courseId, { publishedOnly = false } = {}) {
  const condition = publishedOnly ? 'AND m.is_published = 1' : '';
  const [rows] = await pool.execute(
    `SELECT m.*, COUNT(l.id) AS lesson_count,
            SUM(CASE WHEN l.is_published = 1 THEN 1 ELSE 0 END) AS published_lesson_count
     FROM course_modules m LEFT JOIN course_lessons l ON l.module_id = m.id
     WHERE m.course_id = ? ${condition}
     GROUP BY m.id ORDER BY m.sort_order ASC, m.id ASC`,
    [courseId],
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM course_modules WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findBySlug(courseId, slug, { publishedOnly = false } = {}) {
  const condition = publishedOnly ? 'AND is_published = 1' : '';
  const [rows] = await pool.execute(`SELECT * FROM course_modules WHERE course_id = ? AND slug = ? ${condition} LIMIT 1`, [courseId, slug]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO course_modules (course_id, slug, title, sort_order, is_published) VALUES (?, ?, ?, ?, ?)`,
    [data.courseId, data.slug, data.title, data.sortOrder || 0, data.isPublished ? 1 : 0],
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const [result] = await pool.execute(
    `UPDATE course_modules SET slug = ?, title = ?, sort_order = ?, is_published = ? WHERE id = ?`,
    [data.slug, data.title, data.sortOrder || 0, data.isPublished ? 1 : 0, id],
  );
  return result.affectedRows ? findById(id) : null;
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM course_modules WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function updateSortOrder(ids) {
  await Promise.all(ids.map((id, index) => pool.execute('UPDATE course_modules SET sort_order = ? WHERE id = ?', [index, id])));
}

module.exports = { create, findByCourseId, findById, findBySlug, remove, update, updateSortOrder };

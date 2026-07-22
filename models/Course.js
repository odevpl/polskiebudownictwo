const pool = require('../config/database');

async function findAll({ activeOnly = false } = {}) {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await pool.query(
    `SELECT id, slug, title, description, category, level, lesson_count,
            is_free, is_active, sort_order, created_at, updated_at
     FROM courses
     ${where}
     ORDER BY sort_order ASC, id ASC`,
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM courses WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findBySlug(slug) {
  const [rows] = await pool.execute('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO courses
       (slug, title, description, category, level, lesson_count, is_free, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.description,
      data.category || null,
      data.level || null,
      data.lessonCount || 0,
      data.isFree ? 1 : 0,
      data.isActive ? 1 : 0,
      data.sortOrder || 0,
    ],
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const current = await findById(id);
  if (!current) return null;
  await pool.execute(
    `UPDATE courses
     SET slug = ?, title = ?, description = ?, category = ?, level = ?,
         lesson_count = ?, is_free = ?, is_active = ?, sort_order = ?
     WHERE id = ?`,
    [data.slug, data.title, data.description, data.category || null, data.level || null, data.lessonCount ?? current.lesson_count, data.isFree ? 1 : 0, data.isActive ? 1 : 0, data.sortOrder || 0, id],
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, findAll, findById, findBySlug, remove, update };

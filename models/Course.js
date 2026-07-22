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

module.exports = { create, findAll, findById, findBySlug };

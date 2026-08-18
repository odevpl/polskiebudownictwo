const pool = require('../config/database');

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT *
     FROM mediators
     ORDER BY sort_order ASC, name ASC, id ASC`,
  );
  return rows;
}

async function findPublished() {
  const [rows] = await pool.execute(
    `SELECT *
     FROM mediators
     WHERE is_published = 1
     ORDER BY sort_order ASC, name ASC, id ASC`,
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM mediators WHERE id = ? LIMIT 1',
    [id],
  );
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
  `INSERT INTO mediators (
      name, slug, short_description, full_description, key_experience,
      qualifications, specializations, mediation_modes, is_published, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values(data),
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const [result] = await pool.execute(
    `UPDATE mediators
     SET name = ?, slug = ?, short_description = ?, full_description = ?, key_experience = ?,
         qualifications = ?, specializations = ?, mediation_modes = ?, is_published = ?, sort_order = ?
     WHERE id = ?`,
    [...values(data), id],
  );
  if (!result.affectedRows) return null;
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM mediators WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

function values(data) {
  return [
    data.name,
    data.slug,
    data.shortDescription,
    data.fullDescription,
    data.keyExperience || null,
    data.qualifications || null,
    data.specializations || null,
    data.mediationModes || null,
    data.isPublished ? 1 : 0,
    data.sortOrder,
  ];
}

module.exports = { create, findAll, findById, findPublished, remove, update };

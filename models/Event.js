const pool = require('../config/database');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT id, title, description, upcoming, event_date, event_time
     FROM events
     ORDER BY event_date ASC, event_time ASC, id ASC`,
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await pool.execute(
    'INSERT INTO events (title, description, upcoming, event_date, event_time) VALUES (?, ?, ?, ?, ?)',
    [data.title, data.description, data.upcoming ? 1 : 0, data.eventDate || null, data.eventTime || null],
  );
  return findById(result.insertId);
}

async function update(id, data) {
  await pool.execute(
    'UPDATE events SET title = ?, description = ?, upcoming = ?, event_date = ?, event_time = ? WHERE id = ?',
    [data.title, data.description, data.upcoming ? 1 : 0, data.eventDate || null, data.eventTime || null, id],
  );
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, findAll, findById, remove, update };

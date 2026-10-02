const { randomUUID } = require('node:crypto');
const pool = require('../config/database');

function normalizeAlias(value) {
  return String(value || '').trim().toLowerCase();
}

async function create({ ownerName, ownerEmail, alias = null, adminId }) {
  const code = randomUUID();
  const normalizedAlias = normalizeAlias(alias) || null;
  const [result] = await pool.execute(
    `INSERT INTO affiliate_links (owner_name, owner_email, code, alias, created_by_admin_id)
     VALUES (?, ?, ?, ?, ?)`,
    [ownerName, ownerEmail, code, normalizedAlias, adminId],
  );
  return findById(result.insertId);
}

async function findAll(search = '') {
  const term = `%${String(search).trim()}%`;
  const [rows] = await pool.execute(
    `SELECT l.id, l.owner_name, l.owner_email, l.code, l.alias, l.is_active, l.created_at,
            COUNT(r.id) AS registration_count
     FROM affiliate_links l
     LEFT JOIN affiliate_registrations r ON r.affiliate_link_id = l.id
     WHERE l.owner_name LIKE ? OR l.owner_email LIKE ? OR l.code LIKE ? OR l.alias LIKE ?
     GROUP BY l.id, l.owner_name, l.owner_email, l.code, l.alias, l.is_active, l.created_at
     ORDER BY l.created_at DESC, l.id DESC
     LIMIT 200`,
    [term, term, term, term],
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT l.id, l.owner_name, l.owner_email, l.code, l.alias, l.is_active, l.created_at, l.updated_at,
            a.full_name AS created_by_name, COUNT(r.id) AS registration_count
     FROM affiliate_links l
     LEFT JOIN admins a ON a.id = l.created_by_admin_id
     LEFT JOIN affiliate_registrations r ON r.affiliate_link_id = l.id
     WHERE l.id = ?
     GROUP BY l.id, l.owner_name, l.owner_email, l.code, l.alias, l.is_active, l.created_at, l.updated_at, a.full_name
     LIMIT 1`,
    [id],
  );
  return rows[0] || null;
}

async function findRegistrations(linkId) {
  const [rows] = await pool.execute(
    `SELECT registered_email, created_at
     FROM affiliate_registrations
     WHERE affiliate_link_id = ?
     ORDER BY created_at DESC, id DESC
     LIMIT 500`,
    [linkId],
  );
  return rows;
}

async function findActiveByReference(reference, connection = pool, lock = false) {
  const value = normalizeAlias(reference);
  if (!value) return null;
  const [rows] = await connection.execute(
    `SELECT id
     FROM affiliate_links
     WHERE is_active = 1 AND (code = ? OR alias = ?)
     LIMIT 1${lock ? ' FOR UPDATE' : ''}`,
    [value, value],
  );
  return rows[0] || null;
}

async function recordRegistration(reference, userId, email, connection = pool) {
  const link = await findActiveByReference(reference, connection, true);
  if (!link) return false;
  await connection.execute(
    `INSERT IGNORE INTO affiliate_registrations (affiliate_link_id, user_id, registered_email)
     VALUES (?, ?, ?)`,
    [link.id, userId, email],
  );
  return true;
}

async function deactivate(id) {
  const [result] = await pool.execute('UPDATE affiliate_links SET is_active = 0 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { create, deactivate, findActiveByReference, findAll, findById, findRegistrations, normalizeAlias, recordRegistration };

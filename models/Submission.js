const pool = require('../config/database');

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO submissions (
      first_name,
      last_name,
      company_name,
      email,
      phone,
      roles,
      \`groups\`,
      company_size,
      consent_data,
      consent_marketing,
      ip_address,
      notes,
      status,
      status_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.firstName,
      data.lastName,
      data.companyName,
      data.email,
      data.phone || null,
      JSON.stringify(data.roles),
      JSON.stringify(data.groups || []),
      data.companySize || null,
      data.consentData ? 1 : 0,
      data.consentMarketing ? 1 : 0,
      data.ipAddress || null,
      data.notes || null,
      data.status || 'new',
      JSON.stringify(data.statusTags || []),
    ],
  );

  return {
    id: result.insertId,
    ...data,
  };
}

async function findByEmail(email, excludeId = null) {
  const params = [email];
  const excludeSql = excludeId ? 'AND id <> ?' : '';
  if (excludeId) params.push(excludeId);

  const [rows] = await pool.execute(
    `SELECT *
     FROM submissions
     WHERE email = ?
     ${excludeSql}
     LIMIT 1`,
    params,
  );

  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    roles: parseRoles(row.roles),
    groups: parseRoles(row.groups),
    status_tags: parseRoles(row.status_tags),
  };
}

async function update(id, data) {
  await pool.execute(
    `UPDATE submissions
     SET first_name = ?,
         last_name = ?,
         company_name = ?,
         email = ?,
         phone = ?,
         roles = ?,
         \`groups\` = ?,
         company_size = ?,
         consent_data = ?,
         consent_marketing = ?,
         notes = ?,
         status = ?,
         status_tags = ?
     WHERE id = ?`,
    [
      data.firstName,
      data.lastName,
      data.companyName,
      data.email,
      data.phone || null,
      JSON.stringify(data.roles),
      JSON.stringify(data.groups || []),
      data.companySize || null,
      data.consentData ? 1 : 0,
      data.consentMarketing ? 1 : 0,
      data.notes || null,
      data.status || 'new',
      JSON.stringify(data.statusTags || []),
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM submissions WHERE id = ?',
    [id],
  );
  return result.affectedRows > 0;
}

async function findAll(filters = {}) {
  const where = [];
  const params = [];

  if (filters.search) {
    where.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company_name LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term, term, term);
  }

  if (filters.status) {
    where.push('status = ?');
    params.push(filters.status);
  }

  const page = Math.max(Number(filters.page || 1), 1);
  const limit = Math.min(Math.max(Number(filters.limit || 25), 1), 100);
  const offset = (page - 1) * limit;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.execute(
    `SELECT *
     FROM submissions
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params,
  );
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM submissions
     ${whereSql}`,
    params,
  );

  return {
    rows: rows.map(row => ({
      ...row,
      roles: parseRoles(row.roles),
      groups: parseRoles(row.groups),
      status_tags: parseRoles(row.status_tags),
    })),
    total: countRows[0]?.total || 0,
    page,
    limit,
  };
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM submissions WHERE id = ? LIMIT 1',
    [id],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    roles: parseRoles(row.roles),
    groups: parseRoles(row.groups),
    status_tags: parseRoles(row.status_tags),
  };
}

async function findForExport() {
  const [rows] = await pool.query(
    `SELECT *
     FROM submissions
     ORDER BY created_at DESC`,
  );

  return rows.map(row => ({
    ...row,
    roles: parseRoles(row.roles),
    groups: parseRoles(row.groups),
    status_tags: parseRoles(row.status_tags),
  }));
}

async function findForMailerLiteExport() {
  const [rows] = await pool.query(
    `SELECT *
     FROM submissions
     WHERE consent_marketing = 1
     ORDER BY created_at DESC`,
  );

  return rows.map(row => ({
    ...row,
    roles: parseRoles(row.roles),
  }));
}

function parseRoles(value) {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
}

module.exports = {
  create,
  findAll,
  findForExport,
  findForMailerLiteExport,
  findByEmail,
  findById,
  remove,
  update,
};

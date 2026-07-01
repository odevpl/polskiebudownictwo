const pool = require('../config/database');

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO submissions (
      full_name,
      company_name,
      email,
      phone,
      roles,
      company_size,
      consent_data,
      consent_marketing,
      ip_address,
      notes,
      status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName,
      data.companyName,
      data.email,
      data.phone || null,
      JSON.stringify(data.roles),
      data.companySize || null,
      data.consentData ? 1 : 0,
      data.consentMarketing ? 1 : 0,
      data.ipAddress || null,
      data.notes || null,
      data.status || 'new',
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
  };
}

async function update(id, data) {
  await pool.execute(
    `UPDATE submissions
     SET full_name = ?,
         company_name = ?,
         email = ?,
         phone = ?,
         roles = ?,
         company_size = ?,
         consent_data = ?,
         consent_marketing = ?,
         notes = ?,
         status = ?
     WHERE id = ?`,
    [
      data.fullName,
      data.companyName,
      data.email,
      data.phone || null,
      JSON.stringify(data.roles),
      data.companySize || null,
      data.consentData ? 1 : 0,
      data.consentMarketing ? 1 : 0,
      data.notes || null,
      data.status || 'new',
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
    where.push('(full_name LIKE ? OR email LIKE ? OR company_name LIKE ?)');
    const term = `%${filters.search}%`;
    params.push(term, term, term);
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
  findByEmail,
  findById,
  remove,
  update,
};

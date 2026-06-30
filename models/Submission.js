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
      ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ],
  );

  return {
    id: result.insertId,
    ...data,
  };
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
    `SELECT SQL_CALC_FOUND_ROWS *
     FROM submissions
     ${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );
  const [countRows] = await pool.query('SELECT FOUND_ROWS() AS total');

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
  findById,
};

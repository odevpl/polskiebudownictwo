require('dotenv').config({ quiet: true });

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');

async function migrateMediatorProfile() {
  const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '2026-08-19-mediators-profile-fields.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  const statements = sql
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) await connection.query(statement);
    console.log('Migracja pól profilu mediatorów zakończona.');
  } finally {
    connection.release();
    await pool.end();
  }
}

migrateMediatorProfile().catch(error => {
  console.error('Migracja pól profilu mediatorów nie powiodła się:', error.message);
  process.exitCode = 1;
});

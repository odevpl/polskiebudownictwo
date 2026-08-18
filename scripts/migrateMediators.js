require('dotenv').config({ quiet: true });

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');

async function migrateMediators() {
  const sqlPath = path.join(__dirname, '..', 'sql', 'migrations', '2026-08-18-mediators.sql');
  const sql = await fs.readFile(sqlPath, 'utf8');
  const statements = sql
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const statement of statements) await connection.query(statement);
    await connection.commit();
    console.log('Migracja mediatorów zakończona.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

migrateMediators().catch(error => {
  console.error('Migracja mediatorów nie powiodła się:', error.message);
  process.exitCode = 1;
});

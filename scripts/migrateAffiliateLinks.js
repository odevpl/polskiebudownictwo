require('dotenv').config({ quiet: true });

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');

async function migrateAffiliateLinks() {
  const sql = await fs.readFile(path.join(__dirname, '..', 'sql', 'migrations', '2026-10-02-affiliate-links.sql'), 'utf8');
  const statements = sql.split(';').map(statement => statement.trim()).filter(Boolean);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const statement of statements) await connection.query(statement);
    await connection.commit();
    console.log('Migracja linków afiliacyjnych zakończona.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

migrateAffiliateLinks().catch(error => {
  console.error('Migracja linków afiliacyjnych nie powiodła się:', error.message);
  process.exitCode = 1;
});

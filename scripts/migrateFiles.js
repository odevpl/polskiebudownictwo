require('dotenv').config({ quiet: true });
const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');
async function migrate() {
  const sql = await fs.readFile(path.join(__dirname, '../sql/files.sql'), 'utf8');
  for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await pool.query(statement);
  console.log('Migracja modułu plików zakończona.');
}
migrate().catch(error => { console.error('File migration failed:', error.code || error.name); process.exitCode = 1; }).finally(() => pool.end());

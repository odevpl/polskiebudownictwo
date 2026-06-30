require('dotenv').config({ quiet: true });

const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../config/database');

async function migrate() {
  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  const schema = await fs.readFile(schemaPath, 'utf8');
  const statements = schema
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean);

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
    await connection.query('ALTER TABLE sessions MODIFY expires BIGINT UNSIGNED NOT NULL');
    console.log('Migracje zakonczone.');
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

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
    await ensureUniqueSubmissionEmails(connection);
    console.log('Migracje zakonczone.');
  } finally {
    connection.release();
    await pool.end();
  }
}

async function ensureUniqueSubmissionEmails(connection) {
  const [duplicateRows] = await connection.query(
    `SELECT email, COUNT(*) AS count
     FROM submissions
     GROUP BY email
     HAVING COUNT(*) > 1`,
  );

  if (duplicateRows.length) {
    console.warn('Nie zalozono unikalnego indeksu submissions.email, bo istnieja duplikaty:');
    duplicateRows.forEach(row => {
      console.warn(`- ${row.email}: ${row.count}`);
    });
    return;
  }

  const [indexes] = await connection.query(
    `SHOW INDEX
     FROM submissions
     WHERE Key_name IN ('idx_email', 'uniq_submissions_email')`,
  );
  const hasUniqueIndex = indexes.some(index => index.Key_name === 'uniq_submissions_email');
  const hasOldIndex = indexes.some(index => index.Key_name === 'idx_email');

  if (hasUniqueIndex) return;
  if (hasOldIndex) {
    await connection.query('ALTER TABLE submissions DROP INDEX idx_email');
  }

  await connection.query('ALTER TABLE submissions ADD UNIQUE INDEX uniq_submissions_email (email)');
}

migrate().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

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
    await ensureSubmissionNameColumns(connection);
    await ensureSubmissionGroupsColumn(connection);
    await ensureSubmissionStatusTagsColumn(connection);
    await ensureUniqueSubmissionEmails(connection);
    await ensureEventsUpcomingColumn(connection);
    await ensureEventScheduleNullable(connection);
    await ensureAcademyLessonCountColumn(connection);
    await ensureAcademyPriceColumns(connection);
    await ensureUserAnonymizedAtColumn(connection);
    await ensureOrderRefundColumns(connection);
    console.log('Migracje zakonczone.');
  } finally {
    connection.release();
    await pool.end();
  }
}

async function ensureAcademyLessonCountColumn(connection) {
  const [columns] = await connection.query(
    `SHOW COLUMNS
     FROM courses
     LIKE 'lesson_count'`,
  );

  if (!columns.length) {
    await connection.query(
      'ALTER TABLE courses ADD COLUMN lesson_count SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER level',
    );
  }
}

async function ensureAcademyPriceColumns(connection) {
  const [priceColumns] = await connection.query('SHOW COLUMNS FROM courses LIKE \'price_amount\'');
  if (!priceColumns.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN price_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER level');
  }
  const [currencyColumns] = await connection.query('SHOW COLUMNS FROM courses LIKE \'currency\'');
  if (!currencyColumns.length) {
    await connection.query('ALTER TABLE courses ADD COLUMN currency CHAR(3) NOT NULL DEFAULT \'PLN\' AFTER price_amount');
  }
}

async function ensureUserAnonymizedAtColumn(connection) {
  const [columns] = await connection.query('SHOW COLUMNS FROM users LIKE \'anonymized_at\'');
  if (!columns.length) {
    await connection.query('ALTER TABLE users ADD COLUMN anonymized_at TIMESTAMP NULL AFTER last_login_at');
  }
}

async function ensureOrderRefundColumns(connection) {
  const [requested] = await connection.query('SHOW COLUMNS FROM orders LIKE \'refund_requested_at\'');
  if (!requested.length) await connection.query('ALTER TABLE orders ADD COLUMN refund_requested_at TIMESTAMP NULL AFTER refunded_at');
  const [requestId] = await connection.query('SHOW COLUMNS FROM orders LIKE \'refund_request_id\'');
  if (!requestId.length) await connection.query('ALTER TABLE orders ADD COLUMN refund_request_id VARCHAR(45) AFTER refund_requested_at');
}

async function ensureEventsUpcomingColumn(connection) {
  const [columns] = await connection.query(
    `SHOW COLUMNS
     FROM events
     LIKE 'upcoming'`,
  );

  if (!columns.length) {
    await connection.query('ALTER TABLE events ADD COLUMN upcoming TINYINT(1) NOT NULL DEFAULT 0 AFTER description');
  }
}

async function ensureEventScheduleNullable(connection) {
  await connection.query('ALTER TABLE events MODIFY event_date DATE NULL');
  await connection.query('ALTER TABLE events MODIFY event_time TIME NULL');
}

async function ensureSubmissionNameColumns(connection) {
  const [firstNameColumns] = await connection.query(
    `SHOW COLUMNS
     FROM submissions
     LIKE 'first_name'`,
  );

  const [lastNameColumns] = await connection.query(
    `SHOW COLUMNS
     FROM submissions
     LIKE 'last_name'`,
  );

  const [fullNameColumns] = await connection.query(
    `SHOW COLUMNS
     FROM submissions
     LIKE 'full_name'`,
  );

  if (!firstNameColumns.length) {
    const afterColumn = fullNameColumns.length ? ' AFTER full_name' : ' AFTER id';
    await connection.query(`ALTER TABLE submissions ADD COLUMN first_name VARCHAR(80) NULL${afterColumn}`);
  }

  if (!lastNameColumns.length) {
    await connection.query('ALTER TABLE submissions ADD COLUMN last_name VARCHAR(120) NULL AFTER first_name');
  }

  if (fullNameColumns.length) {
    await connection.query(
      `UPDATE submissions
       SET first_name = SUBSTRING_INDEX(TRIM(full_name), ' ', 1),
           last_name = TRIM(SUBSTRING(TRIM(full_name), LENGTH(SUBSTRING_INDEX(TRIM(full_name), ' ', 1)) + 1))
       WHERE (first_name IS NULL OR first_name = '')
         AND full_name IS NOT NULL
         AND TRIM(full_name) <> ''`,
    );
    await connection.query('ALTER TABLE submissions DROP COLUMN full_name');
  }
}

async function ensureSubmissionGroupsColumn(connection) {
  const [columns] = await connection.query(
    `SHOW COLUMNS
     FROM submissions
     LIKE 'groups'`,
  );

  if (columns.length) return;

  await connection.query('ALTER TABLE submissions ADD COLUMN `groups` JSON NULL AFTER roles');
}

async function ensureSubmissionStatusTagsColumn(connection) {
  const [columns] = await connection.query(
    `SHOW COLUMNS
     FROM submissions
     LIKE 'status_tags'`,
  );

  if (columns.length) return;

  await connection.query('ALTER TABLE submissions ADD COLUMN status_tags JSON NULL AFTER status');
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

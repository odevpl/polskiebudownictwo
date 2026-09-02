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
    await ensureMailerLiteSyncColumns(connection);
    await ensureUniqueSubmissionEmails(connection);
    await ensureEventsUpcomingColumn(connection);
    await ensureEventScheduleNullable(connection);
    await ensureAcademyLessonCountColumn(connection);
    await ensureAcademyPriceColumns(connection);
    await ensureAcademyContentBlocksColumn(connection);
    await ensureAcademyModules(connection);
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

async function ensureAcademyContentBlocksColumn(connection) {
  const [columns] = await connection.query('SHOW COLUMNS FROM course_lessons LIKE \'content_blocks\'');
  if (!columns.length) {
    await connection.query('ALTER TABLE course_lessons ADD COLUMN content_blocks JSON NULL AFTER content');
  }
}

async function ensureAcademyModules(connection) {
  const [columns] = await connection.query('SHOW COLUMNS FROM course_lessons LIKE \'module_id\'');
  if (!columns.length) await connection.query('ALTER TABLE course_lessons ADD COLUMN module_id INT UNSIGNED NULL AFTER course_id');
  const [foreignKeys] = await connection.query(`SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_lessons' AND COLUMN_NAME = 'module_id' AND REFERENCED_TABLE_NAME = 'course_modules'`);
  if (!foreignKeys.length) await connection.query('ALTER TABLE course_lessons ADD CONSTRAINT fk_course_lessons_module FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE');
  const [indexes] = await connection.query(`SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_lessons' AND INDEX_NAME = 'idx_course_lessons_module'`);
  if (!indexes.length) await connection.query('ALTER TABLE course_lessons ADD INDEX idx_course_lessons_module (module_id, is_published, sort_order, id)');

  const [courses] = await connection.query('SELECT c.id, c.title FROM courses c WHERE EXISTS (SELECT 1 FROM course_lessons l WHERE l.course_id = c.id AND l.module_id IS NULL)');
  for (const course of courses) {
    const [existing] = await connection.execute('SELECT id FROM course_modules WHERE course_id = ? ORDER BY id ASC LIMIT 1', [course.id]);
    let moduleId = existing[0]?.id;
    if (!moduleId) {
      const [result] = await connection.execute('INSERT INTO course_modules (course_id, slug, title, description, sort_order, is_published) VALUES (?, \'materialy-szkolenia\', ?, ?, 0, 1)', [course.id, 'Materiały szkolenia', `Moduł utworzony podczas migracji szkolenia „${course.title}”.`]);
      moduleId = result.insertId;
    }
    await connection.execute('UPDATE course_lessons SET module_id = ? WHERE course_id = ? AND module_id IS NULL', [moduleId, course.id]);
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

async function ensureMailerLiteSyncColumns(connection) {
  const columns = [
    ['mailerlite_status', "VARCHAR(20) NOT NULL DEFAULT 'pending' AFTER status_tags"],
    ['mailerlite_attempts', 'SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER mailerlite_status'],
    ['mailerlite_last_error', 'TEXT NULL AFTER mailerlite_attempts'],
    ['mailerlite_next_retry_at', 'DATETIME NULL AFTER mailerlite_last_error'],
    ['mailerlite_synced_at', 'DATETIME NULL AFTER mailerlite_next_retry_at'],
  ];

  let statusColumnAdded = false;
  for (const [name, definition] of columns) {
    const [existing] = await connection.query('SHOW COLUMNS FROM submissions LIKE ?', [name]);
    if (!existing.length) {
      await connection.query(`ALTER TABLE submissions ADD COLUMN ${name} ${definition}`);
      if (name === 'mailerlite_status') statusColumnAdded = true;
    }
  }

  const [indexes] = await connection.query(
    "SHOW INDEX FROM submissions WHERE Key_name = 'idx_mailerlite_retry'",
  );
  if (!indexes.length) {
    await connection.query(
      'ALTER TABLE submissions ADD INDEX idx_mailerlite_retry (mailerlite_status, mailerlite_next_retry_at)',
    );
  }

  // Existing submissions are not imported automatically. New submissions are
  // explicitly enqueued by the form handler after this migration is applied.
  if (statusColumnAdded) {
    await connection.query(
      `UPDATE submissions
       SET mailerlite_status = 'skipped'
       WHERE mailerlite_status = 'pending'
         AND mailerlite_synced_at IS NULL`,
    );
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

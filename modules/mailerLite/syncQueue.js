const pool = require('../../config/database');
const Submission = require('../../models/Submission');
const { isSyncEnabled } = require('./config');
const { syncSubmission } = require('./subscriberService');

const workerIntervalMs = Number(process.env.MAILERLITE_SYNC_INTERVAL_MS || 30000);
const maxErrorLength = 4000;

function maskEmail(email) {
  const [name, domain] = String(email || '').split('@');
  if (!domain) return '[brak e-maila]';
  return `${name.slice(0, 2)}***@${domain}`;
}

function retryDelayMs(attempts) {
  return Math.min(60 * 60 * 1000, 1000 * (2 ** Math.min(attempts, 10)));
}

async function enqueue(submissionId) {
  console.log(`MailerLite queue enqueue: submission=${submissionId}`);
  await pool.execute(
    `UPDATE submissions
     SET mailerlite_status = CASE WHEN consent_marketing = 1 THEN 'pending' ELSE 'skipped' END,
         mailerlite_attempts = 0,
         mailerlite_last_error = NULL,
         mailerlite_next_retry_at = NULL,
         mailerlite_synced_at = NULL
     WHERE id = ?`,
    [submissionId],
  );
  console.log(`MailerLite queue enqueued: submission=${submissionId}`);
}

async function claimNext() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query(
      `SELECT id
       FROM submissions
       WHERE consent_marketing = 1
         AND mailerlite_status IN ('pending', 'failed')
         AND (mailerlite_next_retry_at IS NULL OR mailerlite_next_retry_at <= NOW())
       ORDER BY id DESC
       LIMIT 1
       FOR UPDATE`,
    );

    if (!rows.length) {
      await connection.commit();
      return null;
    }

    const id = rows[0].id;
    await connection.execute(
      `UPDATE submissions
       SET mailerlite_status = 'syncing',
           mailerlite_last_error = NULL
       WHERE id = ?`,
      [id],
    );
    await connection.commit();
    console.log(`MailerLite queue claimed: submission=${id}`);
    return id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function markSynced(id) {
  await pool.execute(
    `UPDATE submissions
     SET mailerlite_status = 'synced',
         mailerlite_synced_at = NOW(),
         mailerlite_next_retry_at = NULL,
         mailerlite_last_error = NULL
     WHERE id = ?`,
    [id],
  );
  console.log(`MailerLite queue synced: submission=${id}`);
}

async function markFailed(id, error) {
  const message = String(error?.message || error).slice(0, maxErrorLength);
  await pool.execute(
    `UPDATE submissions
     SET mailerlite_status = 'failed',
         mailerlite_attempts = mailerlite_attempts + 1,
         mailerlite_last_error = ?,
         mailerlite_next_retry_at = DATE_ADD(NOW(), INTERVAL ? SECOND)
     WHERE id = ?`,
    [message, Math.ceil(retryDelayMs(await attemptsFor(id)) / 1000), id],
  );
  console.log(`MailerLite queue retry scheduled: submission=${id}`);
}

async function attemptsFor(id) {
  const [rows] = await pool.execute(
    'SELECT mailerlite_attempts FROM submissions WHERE id = ? LIMIT 1',
    [id],
  );
  return Number(rows[0]?.mailerlite_attempts || 0);
}

async function processOne(id) {
  console.log(`MailerLite queue processing: submission=${id}`);
  const row = await Submission.findById(id);
  if (!row) {
    console.warn(`MailerLite queue skipped: submission=${id} not found`);
    return;
  }
  if (!row.consent_marketing) {
    console.warn(`MailerLite queue skipped: submission=${id} marketing consent is missing`);
    return;
  }
  if (!isSyncEnabled()) {
    console.warn(`MailerLite queue skipped: submission=${id} synchronizacja jest wyłączona poza produkcją lub bez tokenu API`);
    return;
  }

  const submission = {
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    phone: row.phone,
    roles: row.roles,
    consentMarketing: Boolean(row.consent_marketing),
  };
  console.log(`MailerLite payload prepared: submission=${id}, email=${maskEmail(submission.email)}, roles=${submission.roles.length}`);

  try {
    await syncSubmission(submission);
    await markSynced(id);
  } catch (error) {
    await markFailed(id, error);
    console.error('MailerLite sync attempt failed:', {
      submissionId: id,
      message: error.message,
      status: error.status,
      payload: error.payload,
    });
  }
}

async function processNext() {
  if (!isSyncEnabled()) {
    return;
  }
  const id = await claimNext();
  if (!id) {
    console.log('MailerLite queue idle: no pending submissions');
    return;
  }
  await processOne(id);
}

function startWorker() {
  if (!isSyncEnabled()) {
    console.warn('MailerLite sync disabled: wymaga NODE_ENV=production i MAILERLITE_API_TOKEN.');
    return null;
  }
  console.log(`MailerLite sync worker started (interval: ${workerIntervalMs} ms).`);
  const timer = setInterval(() => {
    processNext().catch(error => console.error('MailerLite sync worker error:', error.message));
  }, workerIntervalMs);
  timer.unref?.();
  processNext().catch(error => console.error('MailerLite initial sync error:', error.message));
  return timer;
}

module.exports = {
  enqueue,
  processNext,
  startWorker,
};

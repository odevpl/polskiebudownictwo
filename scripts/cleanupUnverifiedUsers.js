require('dotenv').config({ quiet: true });

const pool = require('../config/database');

async function cleanup() {
  const hours = Math.max(1, Number(process.env.UNVERIFIED_USER_RETENTION_HOURS || 48));
  const [result] = await pool.execute(
    `DELETE u FROM users u
     WHERE u.email_verified_at IS NULL
       AND u.created_at < DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ${hours} HOUR)
       AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
       AND NOT EXISTS (SELECT 1 FROM user_course_access a WHERE a.user_id = u.id)`,
    [hours],
  );
  console.log(`Usunięto niepotwierdzonych użytkowników: ${result.affectedRows}.`);
}

cleanup().catch(error => { console.error('Cleanup unverified users error:', error); process.exitCode = 1; }).finally(() => pool.end());

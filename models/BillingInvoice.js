const pool = require('../config/database');

async function createPending(orderId, billingSnapshot) {
  await pool.execute(
    `INSERT INTO invoices (order_id, status, billing_snapshot)
     VALUES (?, 'pending', ?)
     ON DUPLICATE KEY UPDATE billing_snapshot = VALUES(billing_snapshot)`,
    [orderId, JSON.stringify(billingSnapshot)],
  );
}

module.exports = { createPending };

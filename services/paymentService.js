const pool = require('../config/database');

async function processWebhook({ provider, eventId, eventType, payload }) {
  const connection = await pool.getConnection();
  let order = null;
  try {
    await connection.beginTransaction();
    const [eventResult] = await connection.execute(
      `INSERT IGNORE INTO payment_events (provider, event_id, event_type, payload)
       VALUES (?, ?, ?, ?)`,
      [provider, eventId, eventType, JSON.stringify(payload)],
    );
    if (!eventResult.affectedRows) {
      await connection.rollback();
      return { duplicate: true };
    }

    const orderNumber = String(payload.orderNumber || payload.order_number || '').trim();
    if (!orderNumber) throw new Error('Webhook nie zawiera numeru zamówienia.');
    const [orderRows] = await connection.execute('SELECT * FROM orders WHERE order_number = ? LIMIT 1 FOR UPDATE', [orderNumber]);
    order = orderRows[0] || null;
    if (!order) throw new Error('Nie znaleziono zamówienia dla webhooka.');

    const status = String(payload.status || '').toLowerCase();
    if (status === 'paid' && order.status !== 'paid') {
      await connection.execute(
        `UPDATE orders
         SET status = 'paid', paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),
             payment_provider = ?, provider_payment_id = ?
         WHERE id = ?`,
        [provider, payload.paymentId || payload.payment_id || null, order.id],
      );
      await grantOrderAccess(connection, order, payload);
      await connection.execute(
        `INSERT INTO invoices (order_id, status, billing_snapshot)
         VALUES (?, 'pending', ?)
         ON DUPLICATE KEY UPDATE billing_snapshot = VALUES(billing_snapshot)`,
        [order.id, order.billing_snapshot],
      );
    } else if (status === 'refunded' && order.status !== 'refunded') {
      await connection.execute('UPDATE orders SET status = \'refunded\', refunded_at = CURRENT_TIMESTAMP WHERE id = ?', [order.id]);
      await revokeOrderAccess(connection, order);
    } else if (status === 'cancelled' && order.status === 'pending') {
      await connection.execute('UPDATE orders SET status = \'cancelled\', cancelled_at = CURRENT_TIMESTAMP WHERE id = ?', [order.id]);
    }
    await connection.commit();
    return { duplicate: false, orderNumber, status };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function grantOrderAccess(connection, order, payload) {
  const [items] = await connection.execute('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  for (const item of items) {
    await connection.execute(
      `INSERT INTO user_course_access
         (user_id, course_id, access_type, status, source_reference)
       VALUES (?, ?, 'purchase', 'active', ?)
       ON DUPLICATE KEY UPDATE
         access_type = 'purchase', status = 'active', revoked_at = NULL,
         revoked_reason = NULL, source_reference = VALUES(source_reference)`,
      [order.user_id, item.course_id, order.order_number],
    );
    const [accessRows] = await connection.execute('SELECT id FROM user_course_access WHERE user_id = ? AND course_id = ? LIMIT 1', [order.user_id, item.course_id]);
    await connection.execute(
      `INSERT INTO academy_access_audit (access_id, user_id, course_id, action, reason)
       VALUES (?, ?, ?, 'grant', ?)`,
      [accessRows[0]?.id || null, order.user_id, item.course_id, `Zakup ${order.order_number}`],
    );
  }
}

async function revokeOrderAccess(connection, order) {
  const [items] = await connection.execute('SELECT course_id FROM order_items WHERE order_id = ?', [order.id]);
  for (const item of items) {
    await connection.execute(
      `UPDATE user_course_access
       SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP, revoked_reason = ?
       WHERE user_id = ? AND course_id = ? AND access_type = 'purchase'`,
      [`Zwrot zamówienia ${order.order_number}`, order.user_id, item.course_id],
    );
  }
}

module.exports = { processWebhook };

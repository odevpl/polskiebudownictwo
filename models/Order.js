const crypto = require('node:crypto');
const pool = require('../config/database');

function orderNumber() {
  return `PB-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

async function createPending({ userId, course, billingSnapshot }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const number = orderNumber();
    const idempotencyKey = crypto.randomBytes(32).toString('hex');
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
         (user_id, order_number, status, currency, total_amount, billing_snapshot, idempotency_key)
       VALUES (?, ?, 'pending', ?, ?, ?, ?)`,
      [userId, number, course.currency || 'PLN', course.price_amount, JSON.stringify(billingSnapshot), idempotencyKey],
    );
    await connection.execute(
      `INSERT INTO order_items
         (order_id, course_id, title_snapshot, slug_snapshot, unit_price, quantity, line_total, currency)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [orderResult.insertId, course.id, course.title, course.slug, course.price_amount, course.price_amount, course.currency || 'PLN'],
    );
    await connection.commit();
    return findById(orderResult.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  rows[0].billing_snapshot = parseJson(rows[0].billing_snapshot);
  rows[0].items = await findItems(rows[0].id);
  return rows[0];
}

async function findByNumber(orderNumberValue) {
  const [rows] = await pool.execute('SELECT * FROM orders WHERE order_number = ? LIMIT 1', [orderNumberValue]);
  if (!rows[0]) return null;
  rows[0].billing_snapshot = parseJson(rows[0].billing_snapshot);
  rows[0].items = await findItems(rows[0].id);
  return rows[0];
}

async function findByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT o.id, o.order_number, o.status, o.currency, o.total_amount,
            o.payment_provider, o.paid_at, o.cancelled_at, o.refunded_at,
            o.refund_requested_at, o.created_at,
            GROUP_CONCAT(oi.title_snapshot ORDER BY oi.id SEPARATOR ', ') AS item_titles
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE o.user_id = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [userId],
  );
  return rows;
}

async function findAdminAll({ status = '', search = '' } = {}) {
  const conditions = [];
  const values = [];
  if (['pending', 'paid', 'cancelled', 'refunded'].includes(status)) { conditions.push('o.status = ?'); values.push(status); }
  if (String(search).trim()) { conditions.push('(u.email LIKE ? OR o.order_number LIKE ? OR oi.title_snapshot LIKE ?)'); const term = `%${String(search).trim()}%`; values.push(term, term, term); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT o.id, o.order_number, o.status, o.currency, o.total_amount,
            o.payment_provider, o.provider_payment_id, o.paid_at, o.refunded_at,
            o.refund_requested_at, o.created_at, u.email,
            GROUP_CONCAT(oi.title_snapshot ORDER BY oi.id SEPARATOR ', ') AS item_titles
     FROM orders o
     INNER JOIN users u ON u.id = o.user_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     ${where}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT 200`,
    values,
  );
  return rows;
}

async function findPaymentEvents(orderNumberValue) {
  const [rows] = await pool.execute(
    `SELECT id, provider, event_id, event_type, payload, processed_at
     FROM payment_events
     WHERE JSON_UNQUOTE(JSON_EXTRACT(payload, '$.orderNumber')) = ?
        OR JSON_UNQUOTE(JSON_EXTRACT(payload, '$.order_number')) = ?
     ORDER BY processed_at DESC`,
    [orderNumberValue, orderNumberValue],
  );
  return rows.map(row => ({ ...row, payload: parseJson(row.payload) }));
}

async function markRefundRequested(id, requestId) {
  await pool.execute(
    `UPDATE orders SET refund_requested_at = CURRENT_TIMESTAMP, refund_request_id = ?
     WHERE id = ? AND status = 'paid' AND refund_requested_at IS NULL`,
    [requestId, id],
  );
}

async function findItems(orderId) {
  const [rows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC', [orderId]);
  return rows;
}

async function attachCheckout(id, checkout) {
  await pool.execute(
    `UPDATE orders
     SET payment_provider = ?, provider_checkout_id = ?
     WHERE id = ? AND status = 'pending'`,
    [checkout.provider, checkout.checkoutId, id],
  );
  return findById(id);
}

function parseJson(value) {
  if (value && typeof value === 'object') return value;
  try { return JSON.parse(value || '{}'); } catch { return {}; }
}

module.exports = { attachCheckout, createPending, findAdminAll, findById, findByNumber, findByUserId, findPaymentEvents, markRefundRequested };

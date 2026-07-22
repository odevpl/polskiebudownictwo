const crypto = require('node:crypto');

function config() {
  const merchantId = Number(process.env.P24_MERCHANT_ID);
  const posId = Number(process.env.P24_POS_ID || merchantId);
  const apiKey = String(process.env.P24_API_KEY || '');
  const crc = String(process.env.P24_CRC || '');
  if (!Number.isSafeInteger(merchantId) || merchantId < 1 || !apiKey || !crc) {
    const error = new Error('Brakuje konfiguracji Przelewy24.');
    error.code = 'PAYMENT_PROVIDER_NOT_CONFIGURED';
    throw error;
  }
  return { merchantId, posId, apiKey, crc };
}

function baseUrl() {
  return String(process.env.P24_ENV || 'sandbox').toLowerCase() === 'production'
    ? 'https://secure.przelewy24.pl'
    : 'https://sandbox.przelewy24.pl';
}

function sign(payload) {
  return crypto.createHash('sha384').update(JSON.stringify(payload)).digest('hex');
}

function amountInGrosze(value) {
  return Math.round(Number(value) * 100);
}

function authHeader(apiKey, merchantId) {
  return `Basic ${Buffer.from(`${merchantId}:${apiKey}`).toString('base64')}`;
}

async function createCheckout(order, request) {
  const { merchantId, posId, apiKey, crc } = config();
  const publicUrl = String(process.env.PUBLIC_BASE_URL || `${request.protocol}://${request.get('host')}`).replace(/\/$/, '');
  const amount = amountInGrosze(order.total_amount);
  const sessionId = order.order_number;
  const payload = {
    merchantId,
    posId,
    sessionId,
    amount,
    currency: order.currency,
    description: `Akademia Polskiego Budownictwa — ${order.items[0]?.title_snapshot || order.order_number}`,
    email: order.billing_snapshot.email || order.billing_snapshot.billing_email || '',
    country: 'PL',
    language: 'pl',
    urlReturn: `${publicUrl}/akademia/platnosc/wynik?order=${encodeURIComponent(order.order_number)}`,
    urlStatus: `${publicUrl}/api/payments/webhook/przelewy24`,
    sign: sign({ sessionId, merchantId, amount, currency: order.currency, crc }),
  };
  const response = await fetch(`${baseUrl()}/api/v1/transaction/register`, {
    method: 'POST',
    headers: { Authorization: authHeader(apiKey, merchantId), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  const token = result.data?.token || result.token;
  if (!response.ok || !token) {
    const error = new Error('Przelewy24 nie utworzyły transakcji.');
    error.details = result;
    throw error;
  }
  return { provider: 'przelewy24', checkoutId: token, checkoutUrl: `${baseUrl()}/trnRequest/${encodeURIComponent(token)}` };
}

function verifyNotificationSignature(notification) {
  const { merchantId, posId, crc } = config();
  const expected = sign({
    merchantId: Number(notification.merchantId),
    posId: Number(notification.posId || posId),
    sessionId: String(notification.sessionId),
    amount: Number(notification.amount),
    originAmount: Number(notification.originAmount),
    currency: String(notification.currency),
    orderId: Number(notification.orderId),
    methodId: Number(notification.methodId),
    statement: String(notification.statement || ''),
    crc,
  });
  return Number(notification.merchantId) === merchantId
    && Number(notification.posId || posId) === posId
    && expected === String(notification.sign || '');
}

async function verifyTransaction(notification) {
  const { merchantId, posId, apiKey, crc } = config();
  const payload = {
    merchantId,
    posId,
    sessionId: String(notification.sessionId),
    amount: Number(notification.amount),
    currency: String(notification.currency),
    orderId: Number(notification.orderId),
    sign: sign({
      sessionId: String(notification.sessionId),
      orderId: Number(notification.orderId),
      amount: Number(notification.amount),
      currency: String(notification.currency),
      crc,
    }),
  };
  const response = await fetch(`${baseUrl()}/api/v1/transaction/verify`, {
    method: 'PUT',
    headers: { Authorization: authHeader(apiKey, merchantId), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  return response.ok && result.data?.status === 'success';
}

async function requestRefund(order, request) {
  const { merchantId, apiKey } = config();
  const publicUrl = String(process.env.PUBLIC_BASE_URL || `${request.protocol}://${request.get('host')}`).replace(/\/$/, '');
  const requestId = crypto.randomBytes(16).toString('hex');
  const amount = amountInGrosze(order.total_amount);
  const payload = {
    requestId,
    refundsUuid: requestId,
    urlStatus: `${publicUrl}/api/payments/webhook/przelewy24/refund`,
    refunds: [{
      orderId: Number(order.provider_payment_id),
      sessionId: order.order_number,
      amount,
      description: `Zwrot ${order.order_number}`.slice(0, 35),
    }],
  };
  const response = await fetch(`${baseUrl()}/api/v1/transaction/refund`, {
    method: 'POST',
    headers: { Authorization: authHeader(apiKey, merchantId), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.data?.status === 'error') {
    const error = new Error('Przelewy24 nie przyjÄ™Å‚y zlecenia zwrotu.');
    error.details = result;
    throw error;
  }
  return { requestId };
}

module.exports = { createCheckout, requestRefund, verifyNotificationSignature, verifyTransaction };

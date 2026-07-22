const crypto = require('node:crypto');
const przelewy24Provider = require('./przelewy24Provider');

function providerName() {
  return String(process.env.PAYMENT_PROVIDER || '').trim().toLowerCase();
}

async function createCheckout(order, request) {
  const provider = providerName();
  if (!provider) {
    const error = new Error('Operator płatności nie jest skonfigurowany.');
    error.code = 'PAYMENT_PROVIDER_NOT_CONFIGURED';
    throw error;
  }
  if (provider === 'przelewy24') return przelewy24Provider.createCheckout(order, request);
  if (provider === 'manual') {
    const baseUrl = String(process.env.PAYMENT_CHECKOUT_BASE_URL || '').replace(/\/$/, '');
    if (!baseUrl) throw new Error('Brakuje PAYMENT_CHECKOUT_BASE_URL.');
    return { provider, checkoutId: order.order_number, checkoutUrl: `${baseUrl}/${encodeURIComponent(order.order_number)}` };
  }
  const error = new Error(`Nieobsługiwany operator płatności: ${provider}.`);
  error.code = 'PAYMENT_PROVIDER_UNSUPPORTED';
  throw error;
}

function verifyWebhook(payload, signature) {
  const secret = String(process.env.PAYMENT_WEBHOOK_SECRET || '');
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
  const actual = String(signature);
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

module.exports = { createCheckout, providerName, verifyWebhook };

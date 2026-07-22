const Course = require('../../models/Course');
const CourseAccess = require('../../models/CourseAccess');
const BillingInvoice = require('../../models/BillingInvoice');
const Order = require('../../models/Order');
const UserBilling = require('../../models/UserBilling');
const paymentProvider = require('../../services/paymentProvider');
const paymentService = require('../../services/paymentService');
const przelewy24Provider = require('../../services/przelewy24Provider');

async function createOrder(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  const slug = String(request.body.courseSlug || '').trim();
  if (!slug) return response.status(422).json({ success: false, message: 'Wybierz kurs.' });
  try {
    const course = await Course.findBySlug(slug);
    if (!course || !course.is_active) return response.status(404).json({ success: false, message: 'Kurs nie istnieje.' });
    if (course.is_free || Number(course.price_amount) <= 0) return response.status(422).json({ success: false, message: 'Ten kurs nie wymaga płatności.' });
    if (await CourseAccess.hasActiveAccess(request.session.user.id, course.id)) return response.status(409).json({ success: false, message: 'Masz już dostęp do tego kursu.' });
    const billing = { ...(await UserBilling.findByUserId(request.session.user.id)), email: request.session.user.email };
    const order = await Order.createPending({ userId: request.session.user.id, course, billingSnapshot: billing });
    await BillingInvoice.createPending(order.id, billing);
    try {
      const checkout = await paymentProvider.createCheckout(order, request);
      const updatedOrder = await Order.attachCheckout(order.id, checkout);
      return response.status(201).json({ success: true, order: updatedOrder, checkoutUrl: checkout.checkoutUrl });
    } catch (error) {
      if (error.code === 'PAYMENT_PROVIDER_NOT_CONFIGURED' || error.code === 'PAYMENT_PROVIDER_UNSUPPORTED') {
        return response.status(503).json({ success: false, message: error.message, orderNumber: order.order_number });
      }
      throw error;
    }
  } catch (error) {
    console.error('Create academy order error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się utworzyć zamówienia.' });
  }
}

async function webhook(request, response) {
  const provider = String(request.params.provider || '').trim().toLowerCase();
  if (provider === 'przelewy24' && request.path.endsWith('/refund')) return przelewy24RefundWebhook(request, response);
  if (provider === 'przelewy24') return przelewy24Webhook(request, response);
  const eventId = String(request.get('x-payment-event-id') || request.body.eventId || '').trim();
  const signature = request.get('x-payment-signature');
  if (!provider || !eventId || !paymentProvider.verifyWebhook(request.body, signature)) {
    return response.status(401).json({ success: false, message: 'Nieprawidłowy webhook.' });
  }
  try {
    const result = await paymentService.processWebhook({ provider, eventId, eventType: request.body.type || 'payment.updated', payload: request.body });
    return response.json({ success: true, ...result });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return response.status(500).json({ success: false, message: 'Webhook nie został przetworzony.' });
  }
}

async function przelewy24RefundWebhook(request, response) {
  const body = request.body || {};
  try {
    const order = await Order.findByNumber(String(body.sessionId || '').trim());
    const requestId = String(body.requestId || body.refundsUuid || '').trim();
    if (!order || order.payment_provider !== 'przelewy24' || order.status !== 'paid'
      || !order.refund_request_id || order.refund_request_id !== requestId
      || String(order.provider_payment_id) !== String(body.orderId)) {
      return response.status(400).json({ success: false, message: 'NieprawidÅ‚owe potwierdzenie zwrotu.' });
    }
    const result = await paymentService.processWebhook({
      provider: 'przelewy24', eventId: `refund:${requestId}`, eventType: 'refund.completed',
      payload: { orderNumber: order.order_number, status: 'refunded', paymentId: String(body.orderId) },
    });
    return response.json({ success: true, ...result });
  } catch (error) {
    console.error('Przelewy24 refund webhook error:', error);
    return response.status(500).json({ success: false, message: 'Nie udaÅ‚o siÄ™ przetworzyÄ‡ potwierdzenia zwrotu.' });
  }
}

async function przelewy24Webhook(request, response) {
  if (!przelewy24Provider.verifyNotificationSignature(request.body)) {
    return response.status(401).json({ success: false, message: 'Nieprawidłowy podpis Przelewy24.' });
  }
  try {
    if (!await przelewy24Provider.verifyTransaction(request.body)) {
      return response.status(400).json({ success: false, message: 'Nie udało się zweryfikować transakcji Przelewy24.' });
    }
    const eventId = `${request.body.sessionId}:${request.body.orderId}`;
    const result = await paymentService.processWebhook({
      provider: 'przelewy24',
      eventId,
      eventType: 'transaction.verified',
      payload: {
        orderNumber: request.body.sessionId,
        status: 'paid',
        paymentId: String(request.body.orderId),
      },
    });
    return response.json({ success: true, ...result });
  } catch (error) {
    console.error('Przelewy24 webhook error:', error);
    return response.status(500).json({ success: false, message: 'Nie udało się przetworzyć powiadomienia Przelewy24.' });
  }
}

module.exports = { createOrder, webhook };

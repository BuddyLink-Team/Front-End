import { PLAN_CODES, PAYMENT_STATUS } from '../constants/subscriptionConstants';
import { MOCK_PLANS, INITIAL_MOCK_SUBSCRIPTION_STATE, MOCK_AUTO_PAY_AFTER_MS } from './subscriptionMockData';

const STORAGE_KEY_STATE = 'buddylink_mock_subscription_v1';
const CHECKOUT_TTL_MS = 15 * 60 * 1000;

// Small artificial delay to simulate realistic network latency
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

class SubscriptionMockService {
  _getState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STATE);
      if (stored) return JSON.parse(stored);
    } catch {
      // Corrupted data: start again from the initial state
    }
    this._saveState(INITIAL_MOCK_SUBSCRIPTION_STATE);
    return structuredClone(INITIAL_MOCK_SUBSCRIPTION_STATE);
  }

  _saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
    } catch {
      // Storage full or disabled: the mock keeps working for this page only
    }
  }

  /**
   * Reject like the real API: { message, error: { code } } with an HTTP status
   */
  _fail(code, message, status = 400) {
    const err = new Error(message);
    err.response = { status, data: { success: false, message, error: { code, details: [] } } };
    throw err;
  }

  _isPremium(subscription) {
    return (
      subscription.planCode !== PLAN_CODES.FREE &&
      subscription.status === 'active' &&
      Boolean(subscription.endDate) &&
      new Date(subscription.endDate) > new Date()
    );
  }

  // Same granting rule as the backend: an active plan is extended, otherwise it starts now
  _grant(state, payment) {
    const now = new Date();
    const current = state.subscription;
    const isActive = this._isPremium(current);
    const anchor = isActive && current.calendarAnchorAt ? new Date(current.calendarAnchorAt) : now;
    const purchasedMonths = (isActive ? current.purchasedMonths : 0) + payment.planSnapshot.durationMonths;
    state.subscription = {
      ...current,
      planCode: payment.planSnapshot.planCode,
      status: 'active',
      startDate: isActive ? current.startDate : now.toISOString(),
      endDate: addMonths(anchor, purchasedMonths).toISOString(),
      calendarAnchorAt: anchor.toISOString(),
      purchasedMonths,
    };
    Object.assign(payment, { status: PAYMENT_STATUS.SUCCESS, paidAt: now.toISOString(), fulfilledAt: now.toISOString() });
  }

  async getPlans() {
    await delay();
    return ok(MOCK_PLANS, 'Subscription plans retrieved successfully');
  }

  async getMySubscription() {
    await delay();
    const { subscription, usage } = this._getState();
    const isPremium = this._isPremium(subscription);
    const premiumUsage = Object.fromEntries(
      Object.entries(usage).map(([feature, quota]) => [feature, { ...quota, limit: -1, remaining: null }])
    );
    return ok(
      {
        isPremium,
        effectivePlanCode: isPremium ? subscription.planCode : PLAN_CODES.FREE,
        subscription,
        usage: isPremium ? premiumUsage : usage,
      },
      'Subscription and quota retrieved successfully'
    );
  }

  async createCheckout(body, idempotencyKey) {
    await delay();
    const plan = MOCK_PLANS.find((p) => p.planCode === body?.planCode && p.price > 0);
    if (!plan) this._fail('INVALID_PLAN', 'Invalid upgrade plan');

    const state = this._getState();
    const existing = state.payments.find((p) => p.idempotencyKey && p.idempotencyKey === idempotencyKey);
    if (existing) {
      if (existing.planSnapshot.planCode !== plan.planCode) {
        this._fail('IDEMPOTENCY_CONFLICT', 'Idempotency-Key was already used for another plan', 409);
      }
      return ok(existing, 'Checkout session created successfully');
    }

    const orderCode = Number(String(Date.now()).slice(-9));
    const description = `BL${orderCode}`;
    const payment = {
      orderCode,
      idempotencyKey,
      status: PAYMENT_STATUS.PENDING,
      planSnapshot: {
        planCode: plan.planCode,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        durationMonths: plan.durationMonths,
      },
      amount: plan.price,
      currency: plan.currency,
      paymentLinkId: `mock_pl_${orderCode}`,
      checkoutUrl: null,
      qrCode: `MOCK-VIETQR|${orderCode}|${plan.price}`,
      bankInfo: { bin: '970422', accountNumber: '0123456789', accountName: 'BUDDYLINK MOCK', description },
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CHECKOUT_TTL_MS).toISOString(),
    };
    state.payments.unshift(payment);
    this._saveState(state);
    return ok(payment, 'Checkout session created successfully');
  }

  async verifyPayment(orderCode) {
    await delay();
    const state = this._getState();
    const payment = state.payments.find((p) => String(p.orderCode) === String(orderCode));
    if (!payment) this._fail('PAYMENT_NOT_FOUND', 'Payment not found', 404);

    if (payment.status === PAYMENT_STATUS.PENDING) {
      const age = Date.now() - new Date(payment.createdAt).getTime();
      if (new Date(payment.expiresAt) < new Date()) {
        payment.status = PAYMENT_STATUS.EXPIRED;
      } else if (age >= MOCK_AUTO_PAY_AFTER_MS) {
        this._grant(state, payment);
      }
      this._saveState(state);
    }
    return ok(payment, 'Payment status retrieved successfully');
  }

  async getPaymentHistory({ page = 1, limit = 10 } = {}) {
    await delay();
    const { payments } = this._getState();
    const pageNumber = Number(page);
    const pageSize = Number(limit);
    const items = payments.slice((pageNumber - 1) * pageSize, pageNumber * pageSize).map((p) => ({
      orderCode: p.orderCode,
      planName: p.planSnapshot.name,
      planCode: p.planSnapshot.planCode,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paidAt: p.paidAt || null,
      createdAt: p.createdAt,
    }));
    return ok(
      { items, pagination: { page: pageNumber, limit: pageSize, total: payments.length } },
      'Payment history retrieved successfully'
    );
  }
}

export const subscriptionMockService = new SubscriptionMockService();
export default subscriptionMockService;

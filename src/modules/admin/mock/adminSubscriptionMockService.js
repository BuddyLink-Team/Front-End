import {
  INITIAL_MOCK_ADMIN_PLANS,
  INITIAL_MOCK_ADMIN_SUBSCRIPTIONS,
  INITIAL_MOCK_ADMIN_TRANSACTIONS,
} from './adminSubscriptionMockData';

const PLAN_STORAGE_KEY = 'buddylink_mock_admin_plans_v1';
const TOTAL_PARENTS = 4;

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const ok = (data, message = 'OK') => ({ success: true, message, data, error: null });

const fail = (status, code, message) => {
  const error = new Error(message);
  error.response = { status, data: { success: false, message, data: null, error: { code, details: [] } } };
  return Promise.reject(error);
};

const paginate = (items, { page = 1, limit = 10 }) => {
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.max(1, Number(limit) || 10);
  return {
    items: items.slice((pageNum - 1) * limitNum, pageNum * limitNum),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: items.length,
      totalPages: Math.ceil(items.length / limitNum) || 1,
    },
  };
};

const matchesParent = (parent, search) => {
  const text = search.trim().toLowerCase();
  return parent.fullName.toLowerCase().includes(text) || parent.email.toLowerCase().includes(text);
};

// 'YYYY-MM-DD' bounds as in the API: the whole toDate day is included
const inRange = (iso, fromDate, toDate) => {
  const day = iso.slice(0, 10);
  return (!fromDate || day >= fromDate) && (!toDate || day <= toDate);
};

/**
 * Stateful mock of the subscription plans & revenue endpoints of the admin API.
 * Plans are kept in localStorage; subscriptions and payments are read-only seed data.
 */
class AdminSubscriptionMockService {
  _getPlans() {
    try {
      const stored = localStorage.getItem(PLAN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [...INITIAL_MOCK_ADMIN_PLANS];
    } catch {
      return [...INITIAL_MOCK_ADMIN_PLANS];
    }
  }

  _savePlans(plans) {
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // Storage unavailable: changes last until reload
    }
  }

  resetFactoryData() {
    this._savePlans(INITIAL_MOCK_ADMIN_PLANS);
  }

  /** GET /admin/plans */
  async getPlans() {
    await delay();
    return ok({ plans: this._getPlans() }, 'Subscription plans retrieved successfully');
  }

  /** GET /admin/plans/:id */
  async getPlanDetail(id) {
    await delay();
    const plan = this._getPlans().find((item) => item.id === id);
    if (!plan) return fail(404, 'PLAN_NOT_FOUND', 'Subscription plan not found');
    return ok({ plan }, 'Subscription plan retrieved successfully');
  }

  /** PATCH /admin/plans/:id (same rules as the API) */
  async updatePlan(id, body = {}) {
    await delay();
    const plans = this._getPlans();
    const plan = plans.find((item) => item.id === id);
    if (!plan) return fail(404, 'PLAN_NOT_FOUND', 'Subscription plan not found');
    if (plan.isFree && ((body.price !== undefined && body.price !== 0) || body.isActive === false)) {
      return fail(400, 'FREE_PLAN_IMMUTABLE', 'Free plan price must remain 0 and stay active');
    }
    if (!plan.isFree && body.price !== undefined && body.price <= 0) {
      return fail(400, 'INVALID_PRICE', 'Premium plan price must be greater than 0');
    }

    const updated = {
      ...plan,
      ...(body.name !== undefined && { name: body.name }),
      ...(body.price !== undefined && { price: Number(body.price) }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.features && { features: { ...plan.features, ...body.features } }),
    };
    this._savePlans(plans.map((item) => (item.id === id ? updated : item)));
    return ok({ plan: updated }, 'Subscription plan updated successfully');
  }

  /** GET /admin/subscriptions */
  async getSubscriptions(query = {}) {
    await delay();
    const items = INITIAL_MOCK_ADMIN_SUBSCRIPTIONS.filter(
      (sub) =>
        (!query.planCode || sub.planCode === query.planCode) &&
        (!query.status || sub.status === query.status) &&
        (!query.search || matchesParent(sub.parent, query.search))
    );
    return ok(paginate(items, query), 'Subscriptions retrieved successfully');
  }

  /** GET /admin/subscriptions/:id */
  async getSubscriptionDetail(id) {
    await delay();
    const subscription = INITIAL_MOCK_ADMIN_SUBSCRIPTIONS.find((item) => item.id === id);
    if (!subscription) return fail(404, 'SUBSCRIPTION_NOT_FOUND', 'Subscription not found');
    return ok(subscription, 'Subscription retrieved successfully');
  }

  /** GET /admin/transactions */
  async getTransactions(query = {}) {
    await delay();
    const search = query.search?.trim() || '';
    const items = INITIAL_MOCK_ADMIN_TRANSACTIONS.filter(
      (payment) =>
        (!query.status || payment.status === query.status) &&
        (!query.planCode || payment.planSnapshot.planCode === query.planCode) &&
        inRange(payment.createdAt, query.fromDate, query.toDate) &&
        (!search || String(payment.orderCode) === search || matchesParent(payment.parent, search))
    );
    return ok(paginate(items, query), 'Payments retrieved successfully');
  }

  /** GET /admin/transactions/:id */
  async getTransactionDetail(id) {
    await delay();
    const payment = INITIAL_MOCK_ADMIN_TRANSACTIONS.find((item) => item.id === id);
    if (!payment) return fail(404, 'PAYMENT_NOT_FOUND', 'Payment transaction not found');
    return ok(payment, 'Payment detail retrieved successfully');
  }

  /** GET /admin/revenue/summary (months of the seed payments in the range) */
  async getRevenueSummary(query = {}) {
    await delay();
    const paid = INITIAL_MOCK_ADMIN_TRANSACTIONS.filter(
      (payment) => payment.status === 'success' && inRange(payment.paidAt, query.fromDate, query.toDate)
    );
    const byMonth = new Map();
    paid.forEach((payment) => {
      const month = payment.paidAt.slice(0, 7);
      const row = byMonth.get(month) || { month, revenue: 0, transactionCount: 0 };
      byMonth.set(month, { ...row, revenue: row.revenue + payment.amount, transactionCount: row.transactionCount + 1 });
    });
    const monthlyRevenue = [...byMonth.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((row) => ({ ...row, label: `T${Number(row.month.slice(5))}/${row.month.slice(0, 4)}` }));
    const payingParents = new Set(paid.map((payment) => payment.parent.id));
    const allTimePaying = new Set(
      INITIAL_MOCK_ADMIN_TRANSACTIONS.filter((p) => p.status === 'success').map((p) => p.parent.id)
    );

    return ok(
      {
        overview: {
          totalRevenue: paid.reduce((sum, payment) => sum + payment.amount, 0),
          successfulTransactions: paid.length,
          payingParentsCount: payingParents.size,
          activePremiumSubscribers: INITIAL_MOCK_ADMIN_SUBSCRIPTIONS.filter((sub) => sub.planCode !== 'free').length,
          conversionRate: Number(((allTimePaying.size / TOTAL_PARENTS) * 100).toFixed(1)),
          churnRate: 0,
        },
        monthlyRevenue,
        filter: {
          fromDate: query.fromDate || monthlyRevenue[0]?.month || new Date().toISOString(),
          toDate: query.toDate || new Date().toISOString(),
        },
      },
      'Revenue summary statistics retrieved successfully'
    );
  }
}

export const adminSubscriptionMockService = new AdminSubscriptionMockService();
export default adminSubscriptionMockService;

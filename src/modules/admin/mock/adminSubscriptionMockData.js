// Seed data of the subscription plans & revenue screen (admin portal, `npm run dev:admin:mock`)

const UNLIMITED_FEATURES = {
  childProfilesLimit: -1,
  discoveryViewLimitPerDay: -1,
  connectionRequestsLimitPerMonth: -1,
  playdatesLimitPerMonth: -1,
  playdateParticipationLimitPerMonth: -1,
  aiAssistantLimitPerMonth: -1,
};

export const INITIAL_MOCK_ADMIN_PLANS = [
  {
    id: 'plan-free',
    planCode: 'free',
    name: 'Gói Miễn Phí (Free)',
    price: 0,
    currency: 'VND',
    durationMonths: 0,
    billingCycle: 'none',
    features: {
      childProfilesLimit: 1,
      discoveryViewLimitPerDay: 5,
      connectionRequestsLimitPerMonth: 5,
      playdatesLimitPerMonth: 3,
      playdateParticipationLimitPerMonth: 3,
      aiAssistantLimitPerMonth: 5,
    },
    isActive: true,
    isFree: true,
  },
  {
    id: 'plan-premium-monthly',
    planCode: 'premium_monthly',
    name: 'Gói Cao Cấp 1 Tháng',
    price: 99000,
    currency: 'VND',
    durationMonths: 1,
    billingCycle: 'monthly',
    features: UNLIMITED_FEATURES,
    isActive: true,
    isFree: false,
  },
  {
    id: 'plan-premium-yearly',
    planCode: 'premium_yearly',
    name: 'Gói Cao Cấp 1 Năm',
    price: 990000,
    currency: 'VND',
    durationMonths: 12,
    billingCycle: 'yearly',
    features: UNLIMITED_FEATURES,
    isActive: true,
    isFree: false,
  },
];

const PARENTS = [
  { id: 'parent-1', fullName: 'Nguyễn Thị Lan', avatarUrl: '', email: 'lan.nguyen@example.com' },
  { id: 'parent-2', fullName: 'Trần Minh Quân', avatarUrl: '', email: 'quan.tran@example.com' },
  { id: 'parent-3', fullName: 'Lê Hoàng Anh', avatarUrl: '', email: 'anh.le@example.com' },
  { id: 'parent-4', fullName: 'Phạm Thu Hà', avatarUrl: '', email: 'ha.pham@example.com' },
];

export const INITIAL_MOCK_ADMIN_SUBSCRIPTIONS = [
  {
    id: 'sub-1',
    parent: PARENTS[0],
    planCode: 'premium_yearly',
    status: 'active',
    startDate: '2026-03-12T02:00:00.000Z',
    endDate: '2027-03-12T02:00:00.000Z',
    purchasedMonths: 12,
    createdAt: '2026-01-05T08:00:00.000Z',
  },
  {
    id: 'sub-2',
    parent: PARENTS[1],
    planCode: 'premium_monthly',
    status: 'active',
    startDate: '2026-10-02T03:00:00.000Z',
    endDate: '2026-11-02T03:00:00.000Z',
    purchasedMonths: 3,
    createdAt: '2026-02-11T08:00:00.000Z',
  },
  {
    id: 'sub-3',
    parent: PARENTS[2],
    planCode: 'free',
    status: 'active',
    startDate: '2026-09-01T03:00:00.000Z',
    endDate: null,
    purchasedMonths: 0,
    createdAt: '2026-04-20T08:00:00.000Z',
  },
  {
    id: 'sub-4',
    parent: PARENTS[3],
    planCode: 'free',
    status: 'active',
    startDate: '2026-08-15T03:00:00.000Z',
    endDate: null,
    purchasedMonths: 0,
    createdAt: '2026-05-02T08:00:00.000Z',
  },
];

const monthlySnapshot = { planCode: 'premium_monthly', name: 'Gói Cao Cấp 1 Tháng', price: 99000, currency: 'VND', durationMonths: 1 };
const yearlySnapshot = { planCode: 'premium_yearly', name: 'Gói Cao Cấp 1 Năm', price: 990000, currency: 'VND', durationMonths: 12 };

const payment = (id, orderCode, parent, snapshot, status, createdAt, grant = null) => ({
  id,
  orderCode,
  parent,
  planSnapshot: snapshot,
  amount: snapshot.price,
  currency: 'VND',
  status,
  paymentMethod: 'payos',
  effectivePeriod: grant,
  paidAt: status === 'success' ? createdAt : null,
  createdAt,
  transactionId: status === 'success' ? `FT${orderCode}` : null,
  failureReason: null,
  grantResult: grant,
});

export const INITIAL_MOCK_ADMIN_TRANSACTIONS = [
  payment('pay-1', 1730001, PARENTS[1], monthlySnapshot, 'success', '2026-10-02T03:00:00.000Z', {
    effectiveStartDate: '2026-10-02T03:00:00.000Z',
    effectiveEndDate: '2026-11-02T03:00:00.000Z',
    monthsGranted: 1,
  }),
  payment('pay-2', 1730002, PARENTS[3], monthlySnapshot, 'expired', '2026-09-28T10:00:00.000Z'),
  payment('pay-3', 1730003, PARENTS[1], monthlySnapshot, 'success', '2026-09-02T03:00:00.000Z', {
    effectiveStartDate: '2026-09-02T03:00:00.000Z',
    effectiveEndDate: '2026-10-02T03:00:00.000Z',
    monthsGranted: 1,
  }),
  payment('pay-4', 1730004, PARENTS[2], yearlySnapshot, 'cancelled', '2026-08-19T07:30:00.000Z'),
  payment('pay-5', 1730005, PARENTS[1], monthlySnapshot, 'success', '2026-08-02T03:00:00.000Z', {
    effectiveStartDate: '2026-08-02T03:00:00.000Z',
    effectiveEndDate: '2026-09-02T03:00:00.000Z',
    monthsGranted: 1,
  }),
  payment('pay-6', 1730006, PARENTS[0], yearlySnapshot, 'success', '2026-03-12T02:00:00.000Z', {
    effectiveStartDate: '2026-03-12T02:00:00.000Z',
    effectiveEndDate: '2027-03-12T02:00:00.000Z',
    monthsGranted: 12,
  }),
];

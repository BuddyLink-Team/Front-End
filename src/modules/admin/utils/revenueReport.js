import { formatDate, formatDateTime } from '../../../utils/formatters';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CHIPS,
  PLAN_BILLING_CYCLE_LABELS,
  PLAN_FEATURE_FIELDS,
  SUBSCRIPTION_PLAN_NAMES,
  SUBSCRIPTION_STATUS_DISPLAY,
  UNLIMITED_LIMIT,
} from '../constants/admin.constants';
import { MONEY_FORMAT, PERCENT_FORMAT } from './excelExport';

const planName = (planCode, fallback) => SUBSCRIPTION_PLAN_NAMES[planCode] || fallback || planCode || '';
const limitText = (value) => (value === UNLIMITED_LIMIT ? 'Không giới hạn' : value);

/**
 * Sheets of the revenue report: title, columns ({ header, key, width, numFmt }) and rows.
 * Dates are written as Vietnamese text so Excel shows them as in the portal.
 * @param {{ summary: Object, plans: Array, subscriptions: Array, transactions: Array, exportedAt?: Date }} data
 */
export const buildRevenueReportSheets = ({ summary, plans, subscriptions, transactions, exportedAt = new Date() }) => {
  const { overview, monthlyRevenue, filter } = summary;
  const period = `${formatDate(filter.fromDate)} - ${formatDate(filter.toDate)}`;

  return [
    {
      name: 'Tổng quan',
      columns: [
        { header: 'Chỉ số', key: 'label', width: 36 },
        { header: 'Giá trị', key: 'value', width: 24 },
      ],
      rows: [
        { label: 'Thời gian xuất', value: formatDateTime(exportedAt) },
        { label: 'Khoảng thời gian', value: period },
        { label: 'Tổng doanh thu', value: overview.totalRevenue, numFmt: MONEY_FORMAT },
        { label: 'Số giao dịch thành công', value: overview.successfulTransactions },
        { label: 'Số phụ huynh thanh toán', value: overview.payingParentsCount },
        { label: 'Premium đang hiệu lực', value: overview.activePremiumSubscribers },
        { label: 'Tỷ lệ chuyển đổi', value: overview.conversionRate, numFmt: PERCENT_FORMAT },
        { label: 'Tỷ lệ rời bỏ', value: overview.churnRate, numFmt: PERCENT_FORMAT },
      ],
    },
    {
      name: 'Doanh thu theo tháng',
      columns: [
        { header: 'Tháng', key: 'label', width: 14 },
        { header: 'Doanh thu', key: 'revenue', width: 18, numFmt: MONEY_FORMAT },
        { header: 'Số giao dịch', key: 'transactionCount', width: 14 },
      ],
      rows: [
        ...monthlyRevenue.map(({ label, revenue, transactionCount }) => ({ label, revenue, transactionCount })),
        {
          label: 'Tổng cộng',
          revenue: monthlyRevenue.reduce((sum, row) => sum + row.revenue, 0),
          transactionCount: monthlyRevenue.reduce((sum, row) => sum + row.transactionCount, 0),
          isTotal: true,
        },
      ],
    },
    {
      name: 'Gói dịch vụ',
      columns: [
        { header: 'Mã gói', key: 'planCode', width: 18 },
        { header: 'Tên gói', key: 'name', width: 30 },
        { header: 'Giá', key: 'price', width: 14, numFmt: MONEY_FORMAT },
        { header: 'Chu kỳ', key: 'cycle', width: 20 },
        { header: 'Trạng thái', key: 'status', width: 14 },
        ...PLAN_FEATURE_FIELDS.map(({ key, label }) => ({ header: label, key, width: 22 })),
      ],
      rows: plans.map((plan) => ({
        planCode: plan.planCode,
        name: plan.name,
        price: plan.price,
        cycle: PLAN_BILLING_CYCLE_LABELS[plan.billingCycle] || plan.billingCycle,
        status: plan.isActive ? 'Đang mở bán' : 'Tạm ngưng',
        ...Object.fromEntries(PLAN_FEATURE_FIELDS.map(({ key }) => [key, limitText(plan.features?.[key])])),
      })),
    },
    {
      name: 'Thuê bao',
      columns: [
        { header: 'Phụ huynh', key: 'parent', width: 26 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Gói', key: 'plan', width: 24 },
        { header: 'Trạng thái', key: 'status', width: 16 },
        { header: 'Ngày bắt đầu', key: 'startDate', width: 18 },
        { header: 'Ngày hết hạn', key: 'endDate', width: 18 },
        { header: 'Số tháng đã mua', key: 'purchasedMonths', width: 16 },
      ],
      rows: subscriptions.map((sub) => ({
        parent: sub.parent?.fullName || '',
        email: sub.parent?.email || '',
        plan: planName(sub.planCode),
        status: SUBSCRIPTION_STATUS_DISPLAY[sub.status]?.label || sub.status,
        startDate: formatDateTime(sub.startDate),
        endDate: sub.endDate ? formatDateTime(sub.endDate) : 'Không thời hạn',
        purchasedMonths: sub.purchasedMonths || 0,
      })),
    },
    {
      name: 'Giao dịch',
      columns: [
        { header: 'Mã đơn', key: 'orderCode', width: 12 },
        { header: 'Phụ huynh', key: 'parent', width: 26 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Gói', key: 'plan', width: 24 },
        { header: 'Số tiền', key: 'amount', width: 14, numFmt: MONEY_FORMAT },
        { header: 'Phương thức', key: 'method', width: 16 },
        { header: 'Trạng thái', key: 'status', width: 16 },
        { header: 'Tạo lúc', key: 'createdAt', width: 18 },
        { header: 'Thanh toán lúc', key: 'paidAt', width: 18 },
        { header: 'Hiệu lực từ', key: 'effectiveFrom', width: 18 },
        { header: 'Hiệu lực đến', key: 'effectiveTo', width: 18 },
      ],
      rows: transactions.map((payment) => ({
        orderCode: payment.orderCode,
        parent: payment.parent?.fullName || '',
        email: payment.parent?.email || '',
        plan: planName(payment.planSnapshot?.planCode, payment.planSnapshot?.name),
        amount: payment.amount,
        method: PAYMENT_METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod || '',
        status: PAYMENT_STATUS_CHIPS[payment.status]?.label || payment.status,
        createdAt: formatDateTime(payment.createdAt),
        paidAt: formatDateTime(payment.paidAt),
        effectiveFrom: formatDateTime(payment.effectivePeriod?.effectiveStartDate),
        effectiveTo: formatDateTime(payment.effectivePeriod?.effectiveEndDate),
      })),
    },
  ];
};


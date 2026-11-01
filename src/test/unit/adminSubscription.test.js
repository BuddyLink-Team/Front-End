import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initMockServer } from '../../mock';
import apiClient from '../../services/apiClient';
import { adminApi } from '../../modules/admin/api/adminApi';
import adminSubscriptionMockService from '../../modules/admin/mock/adminSubscriptionMockService';
import { getPlanFormSchema } from '../../modules/admin/validation/planValidation';
import ExcelJS from 'exceljs';
import { buildRevenueReportSheets } from '../../modules/admin/utils/revenueReport';
import { createWorkbookBlob, fetchAllPages, REPORT_PAGE_LIMIT } from '../../modules/admin/utils/excelExport';
import {
  INITIAL_MOCK_ADMIN_PLANS,
  INITIAL_MOCK_ADMIN_SUBSCRIPTIONS,
  INITIAL_MOCK_ADMIN_TRANSACTIONS,
} from '../../modules/admin/mock/adminSubscriptionMockData';

const FEATURES = {
  childProfilesLimit: '1',
  discoveryViewLimitPerDay: '5',
  connectionRequestsLimitPerMonth: '5',
  playdatesLimitPerMonth: '3',
  playdateParticipationLimitPerMonth: '3',
  aiAssistantLimitPerMonth: '-1',
};

describe('getPlanFormSchema', () => {
  it('Free plan: name and whole limits (-1 = unlimited), price and on-sale state not sent', () => {
    const result = getPlanFormSchema(true).safeParse({ name: ' Gói Free ', features: FEATURES, price: 5, isActive: false });
    expect(result.data).toEqual({
      name: 'Gói Free',
      features: expect.objectContaining({ childProfilesLimit: 1, aiAssistantLimitPerMonth: -1 }),
    });

    const invalid = getPlanFormSchema(true).safeParse({ name: '', features: { ...FEATURES, childProfilesLimit: '' } });
    expect(invalid.error.issues.map((issue) => issue.path.join('.'))).toEqual(['name', 'features.childProfilesLimit']);
  });

  it('Premium plan: limits too, price above 0 and the on-sale state', () => {
    const schema = getPlanFormSchema(false);
    expect(schema.safeParse({ name: 'Gói Tháng', price: '0', isActive: true, features: FEATURES }).success).toBe(false);
    const result = schema.safeParse({ name: 'Gói Tháng', price: '89000', isActive: false, features: FEATURES });
    expect(result.data).toMatchObject({ price: 89000, isActive: false, features: { discoveryViewLimitPerDay: 5 } });
  });
});

describe('revenue report', () => {
  it('reads every page of a list', async () => {
    const fetchPage = vi.fn(({ page }) =>
      Promise.resolve({ items: [`row-${page}`], pagination: { page, totalPages: 3 } })
    );
    expect(await fetchAllPages(fetchPage, { status: 'success' })).toEqual(['row-1', 'row-2', 'row-3']);
    expect(fetchPage).toHaveBeenCalledWith({ status: 'success', page: 2, limit: REPORT_PAGE_LIMIT });
  });

  it('has the overview, monthly revenue, plans, subscriptions and payments sheets', () => {
    const sheets = buildRevenueReportSheets({
      summary: {
        overview: {
          totalRevenue: 198000,
          successfulTransactions: 2,
          payingParentsCount: 1,
          activePremiumSubscribers: 1,
          conversionRate: 25,
          churnRate: 0,
        },
        monthlyRevenue: [
          { month: '2026-09', label: 'T9/2026', revenue: 99000, transactionCount: 1 },
          { month: '2026-10', label: 'T10/2026', revenue: 99000, transactionCount: 1 },
        ],
        filter: { fromDate: '2026-09-01T00:00:00.000Z', toDate: '2026-10-28T00:00:00.000Z' },
      },
      plans: INITIAL_MOCK_ADMIN_PLANS,
      subscriptions: INITIAL_MOCK_ADMIN_SUBSCRIPTIONS,
      transactions: INITIAL_MOCK_ADMIN_TRANSACTIONS,
    });

    expect(sheets.map((sheet) => sheet.name)).toEqual([
      'Tổng quan',
      'Doanh thu theo tháng',
      'Gói dịch vụ',
      'Thuê bao',
      'Giao dịch',
    ]);
    const [overview, monthly, plans, subscriptions, payments] = sheets;
    expect(overview.rows.find((row) => row.label === 'Tổng doanh thu')).toMatchObject({ value: 198000 });
    expect(monthly.rows.at(-1)).toMatchObject({ label: 'Tổng cộng', revenue: 198000, transactionCount: 2 });
    expect(plans.rows.find((row) => row.planCode === 'premium_monthly').childProfilesLimit).toBe('Không giới hạn');
    expect(subscriptions.rows).toHaveLength(INITIAL_MOCK_ADMIN_SUBSCRIPTIONS.length);
    expect(payments.rows[0]).toMatchObject({ orderCode: 1730001, status: 'Thành công', method: 'VietQR (PayOS)' });
  });

  it('writes an .xlsx file whose Vietnamese text reads back as is', async () => {
    const blob = await createWorkbookBlob([
      {
        name: 'Giao dịch',
        columns: [
          { header: 'Phụ huynh', key: 'parent', width: 20 },
          { header: 'Số tiền', key: 'amount', width: 12, numFmt: '#,##0 "₫"' },
        ],
        rows: [{ parent: 'Nguyễn Thị Lan', amount: 99000 }],
      },
    ]);
    const workbook = new ExcelJS.Workbook();
    // jsdom's Blob has no arrayBuffer()
    const buffer = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(blob);
    });
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Giao dịch');
    expect(sheet.getRow(1).values.slice(1)).toEqual(['Phụ huynh', 'Số tiền']);
    expect(sheet.getRow(2).values.slice(1)).toEqual(['Nguyễn Thị Lan', 99000]);
  });
});

describe('Admin subscription mock API', () => {
  const originalBaseURL = apiClient.defaults.baseURL;

  beforeEach(() => {
    apiClient.defaults.baseURL = 'http://localhost:5001/api/v1/admin';
    adminSubscriptionMockService.resetFactoryData();
    initMockServer();
  });

  afterEach(() => {
    apiClient.defaults.baseURL = originalBaseURL;
  });

  it('updates a plan, its limits included, and applies the API rules', async () => {
    const { data } = await adminApi.getPlans();
    const free = data.plans.find((plan) => plan.isFree);
    const monthly = data.plans.find((plan) => plan.planCode === 'premium_monthly');

    const updated = await adminApi.updatePlan(monthly.id, { price: 89000, features: { childProfilesLimit: 3 } });
    expect(updated.data.plan).toMatchObject({ price: 89000, features: { childProfilesLimit: 3, aiAssistantLimitPerMonth: -1 } });
    expect((await adminApi.getPlanDetail(monthly.id)).data.plan.price).toBe(89000);

    await expect(adminApi.updatePlan(free.id, { isActive: false })).rejects.toMatchObject({
      error: { code: 'FREE_PLAN_IMMUTABLE' },
    });
  });

  it('returns one subscription', async () => {
    const { data } = await adminApi.getSubscriptionDetail('sub-2');
    expect(data).toMatchObject({ planCode: 'premium_monthly', parent: { fullName: 'Trần Minh Quân' } });
  });

  it('filters transactions by order code and includes the whole toDate day', async () => {
    const byCode = await adminApi.getTransactions({ search: '1730001' });
    expect(byCode.data.items.map((item) => item.orderCode)).toEqual([1730001]);

    const oneDay = await adminApi.getTransactions({ fromDate: '2026-10-02', toDate: '2026-10-02' });
    expect(oneDay.data.items.map((item) => item.orderCode)).toEqual([1730001]);
  });

  it('sums the successful payments of the range by month', async () => {
    const { data } = await adminApi.getRevenueSummary({ fromDate: '2026-08-01', toDate: '2026-10-31' });
    expect(data.overview.totalRevenue).toBe(3 * 99000);
    expect(data.monthlyRevenue.map((row) => row.label)).toEqual(['T8/2026', 'T9/2026', 'T10/2026']);
  });
});

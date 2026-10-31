import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { AdminSubscriptionManagementPage } from '../../modules/admin/pages/AdminSubscriptionManagementPage';
import { adminApi } from '../../modules/admin/api/adminApi';
import { INITIAL_MOCK_ADMIN_PLANS } from '../../modules/admin/mock/adminSubscriptionMockData';

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../../hooks/useToast', () => ({ useToast: () => toastMock }));

vi.mock('../../modules/admin/api/adminApi', () => ({
  adminApi: {
    getPlans: vi.fn(),
    getPlanDetail: vi.fn(),
    updatePlan: vi.fn(),
    getSubscriptions: vi.fn(),
    getSubscriptionDetail: vi.fn(),
    getTransactions: vi.fn(),
    getTransactionDetail: vi.fn(),
    getRevenueSummary: vi.fn(),
  },
}));

// recharts needs a sized container, which jsdom does not lay out
vi.mock('../../components/charts/BarChart', () => ({
  BarChart: ({ data }) => <ul data-testid="revenue-chart">{data.map((row) => <li key={row.month}>{row.label}</li>)}</ul>,
}));

const summaryResponse = {
  success: true,
  data: {
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
    filter: { fromDate: '2026-05-01T00:00:00.000Z', toDate: '2026-10-28T00:00:00.000Z' },
  },
};

const monthly = INITIAL_MOCK_ADMIN_PLANS.find((plan) => plan.planCode === 'premium_monthly');
const free = INITIAL_MOCK_ADMIN_PLANS.find((plan) => plan.isFree);

const openPlansTab = async () => {
  renderWithProviders(<AdminSubscriptionManagementPage />);
  fireEvent.click(screen.getByRole('button', { name: /Gói dịch vụ/ }));
  return (await screen.findByText(monthly.name)).closest('div.rounded-2xl');
};

describe('AdminSubscriptionManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getRevenueSummary.mockResolvedValue(summaryResponse);
    adminApi.getPlans.mockResolvedValue({ success: true, data: { plans: INITIAL_MOCK_ADMIN_PLANS } });
    adminApi.getPlanDetail.mockImplementation((id) =>
      Promise.resolve({ success: true, data: { plan: INITIAL_MOCK_ADMIN_PLANS.find((plan) => plan.id === id) } })
    );
  });

  it('shows the revenue KPIs and the revenue by month', async () => {
    renderWithProviders(<AdminSubscriptionManagementPage />);

    expect(await screen.findByText('Tổng doanh thu')).toBeInTheDocument();
    expect(screen.getByText(/198\.000/)).toBeInTheDocument();
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(within(screen.getByTestId('revenue-chart')).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'T9/2026',
      'T10/2026',
    ]);
  });

  it('edits the limits and price of a Premium plan, confirming the new price', async () => {
    adminApi.updatePlan.mockResolvedValue({ success: true, data: { plan: { ...monthly, price: 89000 } } });
    const card = await openPlansTab();
    expect(within(card).getAllByText('Không giới hạn')).toHaveLength(6);

    fireEvent.click(within(card).getByRole('button', { name: 'Chỉnh sửa gói' }));
    fireEvent.change(await screen.findByLabelText(/^Giá tiền \(VNĐ\)/), { target: { value: '89000' } });
    // Turn "Vô cực" off for the child profiles: the field comes back with its default limit
    fireEvent.click(screen.getByRole('switch', { name: 'Hồ sơ trẻ tối đa: vô cực' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý đổi giá' }));
    await waitFor(() =>
      expect(adminApi.updatePlan).toHaveBeenCalledWith(
        monthly.id,
        expect.objectContaining({ price: 89000, isActive: true, features: expect.objectContaining({ childProfilesLimit: 1 }) })
      )
    );
    expect(adminApi.getPlanDetail).toHaveBeenCalledWith(monthly.id);
  });

  it('reloads the plan each time the edit modal opens, without the values of a cancelled edit', async () => {
    await openPlansTab();
    const freeCard = screen.getByText(free.name).closest('div.rounded-2xl');

    fireEvent.click(within(freeCard).getByRole('button', { name: 'Chỉnh sửa cấu hình' }));
    const field = await screen.findByLabelText(/^Lượt quẹt hồ sơ \/ ngày \*$/);
    fireEvent.change(field, { target: { value: '42' } });
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));

    fireEvent.click(within(freeCard).getByRole('button', { name: 'Chỉnh sửa cấu hình' }));
    expect(await screen.findByLabelText(/^Lượt quẹt hồ sơ \/ ngày \*$/)).toHaveValue(5);
    expect(adminApi.getPlanDetail).toHaveBeenCalledTimes(2);
  });
});

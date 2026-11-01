import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { AdminUserManagementPage } from '../../modules/admin/pages/AdminUserManagementPage';
import { AdminChildManagementPage } from '../../modules/admin/pages/AdminChildManagementPage';
import { adminApi } from '../../modules/admin/api/adminApi';

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../../hooks/useToast', () => ({ useToast: () => toastMock }));

vi.mock('../../modules/admin/api/adminApi', () => ({
  adminApi: {
    getUsers: vi.fn(),
    getUserStats: vi.fn(),
    getUserDetail: vi.fn(),
    updateUserStatus: vi.fn(),
    getChildren: vi.fn(),
    getChildStats: vi.fn(),
    getChildDetail: vi.fn(),
    getPayments: vi.fn(),
  },
}));

const mockUsersResponse = {
  items: [
    {
      id: 'user-1',
      fullName: 'Nguyễn Văn Phụ Huynh',
      email: 'parent1@example.com',
      phone: '0901234567',
      role: 'parent',
      isActive: true,
      avatar: '',
      city: 'Hồ Chí Minh',
      isVerifiedParent: true,
      isProfileHidden: false,
      childrenCount: 2,
      currentPlan: {
        planCode: 'premium_monthly',
        isPremium: true,
        endDate: '2026-12-31',
      },
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'user-2',
      fullName: 'Trần Thị Mẹ',
      email: 'parent2@example.com',
      phone: '0907654321',
      role: 'parent',
      isActive: false,
      avatar: '',
      city: 'Hà Nội',
      isVerifiedParent: false,
      isProfileHidden: true,
      childrenCount: 1,
      currentPlan: {
        planCode: 'free',
        isPremium: false,
        endDate: null,
      },
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
};

const mockUserDetailResponse = {
  id: 'user-1',
  parentId: 'parent-1',
  fullName: 'Nguyễn Văn Phụ Huynh',
  email: 'parent1@example.com',
  phone: '0901234567',
  avatar: '',
  bio: 'Yêu thích kết nối các hoạt động cho trẻ',
  location: { area: 'Phường Hải Châu', city: 'Đà Nẵng' },
  isActive: true,
  isProfileHidden: false,
  connectionPrivacy: 'nobody',
  loginMethods: ['password', 'google'],
  verification: {
    isVerifiedParent: true,
    isPhoneVerified: true,
    isEmailVerified: true,
  },
  streak: { currentWeeklyStreak: 3, longestStreak: 5 },
  activeChildrenCount: 1,
  archivedChildrenCount: 1,
  children: [
    { id: 'child-1', displayName: 'Bé Bống', age: 5, gender: 'girl', isArchived: false, isPlanLocked: false },
    { id: 'child-3', displayName: 'Bé Cũ', age: 0, gender: 'boy', isArchived: true, isPlanLocked: false },
  ],
  subscription: {
    planCode: 'premium_monthly',
    isPremium: true,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    purchasedMonths: 12,
  },
  activity: {
    connections: 4,
    playdates: { all: 6, upcoming: 1, completed: 4, cancelled: 1 },
    reports: { total: 2, open: 1 },
  },
  createdAt: '2026-01-01T00:00:00.000Z',
};

const mockPaymentsResponse = {
  items: [
    {
      id: 'pay-1',
      orderCode: 10001,
      amount: 99000,
      currency: 'VND',
      status: 'success',
      planName: 'Gói Premium (1 Tháng)',
      planCode: 'premium_monthly',
      paidAt: '2026-01-01T10:00:00.000Z',
      createdAt: '2026-01-01T09:55:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 5,
    total: 7,
    totalPages: 1,
  },
};

const mockChildrenResponse = {
  items: [
    {
      id: 'child-1',
      displayName: 'Bé Bống',
      birthDate: '2021-05-15',
      age: 5,
      gender: 'girl',
      parentUserId: 'user-1',
      parentName: 'Nguyễn Văn Phụ Huynh',
      isArchived: false,
      visibility: 'visible',
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'child-2',
      displayName: 'Bé Sóc',
      birthDate: '2020-03-10',
      age: 6,
      gender: 'boy',
      parentUserId: 'user-2',
      parentName: 'Trần Thị Mẹ',
      isArchived: true,
      visibility: 'archived',
      createdAt: '2026-01-03T00:00:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    totalPages: 1,
  },
};

const mockChildDetailResponse = {
  id: 'child-1',
  displayName: 'Bé Bống',
  dateOfBirth: '2021-05-15',
  age: 5,
  gender: 'girl',
  personality: ['Hòa đồng', 'Sáng tạo'],
  interests: ['Vẽ tranh', 'Bơi lội'],
  favoriteActivities: ['Đọc sách', 'Lắp ráp Lego'],
  visibility: 'plan_locked',
  parent: {
    parentUserId: 'user-1',
    fullName: 'Nguyễn Văn Phụ Huynh',
    email: 'parent1@example.com',
    phone: '0901234567',
    area: 'Phường Hải Châu',
    city: 'Đà Nẵng',
    isActive: true,
    isProfileHidden: false,
    isVerifiedParent: true,
  },
  isArchived: false,
  createdAt: '2026-01-02T00:00:00.000Z',
};

describe('AdminUserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getUsers.mockResolvedValue(mockUsersResponse);
    adminApi.getUserStats.mockResolvedValue({ total: 1248, active: 1200, locked: 48, premium: 96 });
    adminApi.getUserDetail.mockResolvedValue(mockUserDetailResponse);
    adminApi.getPayments.mockResolvedValue(mockPaymentsResponse);
    adminApi.updateUserStatus.mockResolvedValue({ success: true });
  });

  it('renders user list with correct status, plan, and children count', async () => {
    renderWithProviders(<AdminUserManagementPage />);

    expect(screen.getByText('Quản lý phụ huynh')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
      expect(screen.getByText('Trần Thị Mẹ')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    expect(within(table).getByText('parent1@example.com')).toBeInTheDocument();
    expect(within(table).getByText('Đang hoạt động')).toBeInTheDocument();
    expect(within(table).getByText('Đã khóa')).toBeInTheDocument();
    expect(within(table).getByText('Gói Premium (1 Tháng)')).toBeInTheDocument();
    expect(within(table).getByText('Gói Miễn phí')).toBeInTheDocument();
    expect(within(table).getByText('Ẩn hồ sơ')).toBeInTheDocument();
    expect(within(table).queryByText('user-1')).not.toBeInTheDocument();
  });

  it('opens detail drawer when row is clicked and loads profile + payments', async () => {
    renderWithProviders(<AdminUserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Nguyễn Văn Phụ Huynh'));

    await waitFor(() => {
      expect(adminApi.getUserDetail).toHaveBeenCalledWith('user-1');
      expect(adminApi.getPayments).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'parent-1' })
      );
    });

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Chi tiết tài khoản phụ huynh')).toBeInTheDocument();
    await waitFor(() => {
      expect(within(dialog).getByText(/Yêu thích kết nối các hoạt động cho trẻ/)).toBeInTheDocument();
      expect(within(dialog).getByText('Bé Bống')).toBeInTheDocument();
      expect(within(dialog).getByText(/Lịch sử giao dịch/)).toBeInTheDocument();
    });
  });

  it('shows the activity summary, area, login methods, plan and child counts in the drawer', async () => {
    renderWithProviders(<AdminUserManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Nguyễn Văn Phụ Huynh'));

    const dialog = await screen.findByRole('dialog');
    await waitFor(() => {
      expect(within(dialog).getByText('Hoạt động')).toBeInTheDocument();
    });
    expect(within(dialog).getByText('1 sắp tới · 4 đã chơi · 1 đã hủy')).toBeInTheDocument();
    expect(within(dialog).getByText('1 đang chờ xử lý')).toBeInTheDocument();
    expect(within(dialog).getByText('Phường Hải Châu, Đà Nẵng')).toBeInTheDocument();
    expect(within(dialog).getByText('Email & mật khẩu, Google')).toBeInTheDocument();
    expect(within(dialog).getByText('Nhận lời mời kết nối')).toBeInTheDocument();
    expect(within(dialog).getByText('Không ai')).toBeInTheDocument();
    // No raw IDs in the drawer; the avatar falls back to the parent's initials
    expect(within(dialog).queryByText(/user-1/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/Mã người dùng/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText('A')).not.toBeInTheDocument();
    expect(within(dialog).getByText('12 tháng')).toBeInTheDocument();
    expect(within(dialog).getByText(/Hồ sơ các bé \(1\)/)).toBeInTheDocument();
    expect(within(dialog).getByText('· 1 đã xóa')).toBeInTheDocument();
    expect(within(dialog).getByText(/Dưới 1 tuổi/)).toBeInTheDocument();
    await waitFor(() => {
      expect(within(dialog).getByText('Lịch sử giao dịch (7)')).toBeInTheDocument();
      expect(within(dialog).getByText('Thành công')).toBeInTheDocument();
    });
  });

  it('locks an account from the confirmation dialog without asking for a reason', async () => {
    renderWithProviders(<AdminUserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTitle('Khóa tài khoản')[0]);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Khóa tài khoản phụ huynh')).toBeInTheDocument();
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Khóa tài khoản' }));

    await waitFor(() => {
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith('user-1', { isActive: false });
      expect(adminApi.getUsers).toHaveBeenCalledTimes(2); // Initial + refetch
      expect(adminApi.getUserStats).toHaveBeenCalledTimes(2); // Counts follow the status change
    });
  });

  it('shows platform-wide counts in cards that are not clickable', async () => {
    renderWithProviders(<AdminUserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('1.248')).toBeInTheDocument();
    });
    ['48', '96'].forEach((count) => expect(screen.getByText(count).closest('button')).toBeNull());
  });

  it('has one status tab per count and sends the filter of each tab', async () => {
    renderWithProviders(<AdminUserManagementPage />);
    await waitFor(() => {
      expect(adminApi.getUsers).toHaveBeenCalled();
    });
    expect(adminApi.getUsers.mock.calls[0][0]).not.toHaveProperty('status');

    const expectLastQuery = (query) =>
      waitFor(() => {
        const params = adminApi.getUsers.mock.calls.at(-1)[0];
        expect(params).toEqual(expect.objectContaining(query));
        expect(params).not.toHaveProperty('status');
      });

    fireEvent.click(screen.getByRole('button', { name: 'Đã khóa' }));
    await expectLastQuery({ isActive: 'false' });

    fireEvent.click(screen.getByRole('button', { name: 'Premium đang hiệu lực' }));
    await expectLastQuery({ isPremium: 'true' });
    expect(adminApi.getUsers.mock.calls.at(-1)[0]).not.toHaveProperty('isActive');

    fireEvent.click(screen.getByRole('button', { name: 'Tất cả' }));
    await waitFor(() => {
      expect(adminApi.getUsers.mock.calls.at(-1)[0]).not.toHaveProperty('isPremium');
    });
  });

  it('reloads the open detail drawer after locking from it', async () => {
    adminApi.getUserDetail
      .mockResolvedValueOnce(mockUserDetailResponse)
      .mockResolvedValueOnce({ ...mockUserDetailResponse, isActive: false });

    renderWithProviders(<AdminUserManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Nguyễn Văn Phụ Huynh'));

    const drawer = await screen.findByRole('dialog');
    fireEvent.click(await within(drawer).findByRole('button', { name: /Khóa tài khoản/ }));

    const confirm = screen.getAllByRole('dialog').at(-1);
    fireEvent.click(within(confirm).getByRole('button', { name: 'Khóa tài khoản' }));

    await waitFor(() => {
      expect(adminApi.getUserDetail).toHaveBeenCalledTimes(2);
      expect(within(screen.getAllByRole('dialog')[0]).getByRole('button', { name: /Mở khóa tài khoản/ }))
        .toBeInTheDocument();
    });
  });

  it('shows a Vietnamese message for backend error codes when the lock fails', async () => {
    adminApi.updateUserStatus.mockRejectedValue({
      success: false,
      message: 'Admins cannot lock other admins',
      error: { code: 'CANNOT_LOCK_ADMIN', details: [] },
    });

    renderWithProviders(<AdminUserManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTitle('Khóa tài khoản')[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Khóa tài khoản' }));

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('Không thể khóa tài khoản quản trị viên khác.');
    });
  });
});

describe('AdminChildManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getChildren.mockResolvedValue(mockChildrenResponse);
    adminApi.getChildStats.mockResolvedValue({ total: 320, active: 300, archived: 20, planLocked: 7 });
    adminApi.getChildDetail.mockResolvedValue(mockChildDetailResponse);
  });

  it('shows platform-wide child counts in cards that are not clickable', async () => {
    renderWithProviders(<AdminChildManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('320')).toBeInTheDocument();
    });
    ['20', '7'].forEach((count) => expect(screen.getByText(count).closest('button')).toBeNull());
  });

  it('keeps the list usable when the counts cannot be loaded', async () => {
    adminApi.getChildStats.mockRejectedValue({ code: 'INTERNAL_ERROR' });
    renderWithProviders(<AdminChildManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Không tải được số liệu thống kê.')).toBeInTheDocument();
    });
    expect(screen.getByText('Bé Bống')).toBeInTheDocument();
  });

  it('renders children list with gender badges and parent references', async () => {
    renderWithProviders(<AdminChildManagementPage />);

    expect(screen.getByText('Quản lý hồ sơ trẻ')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Bé Bống')).toBeInTheDocument();
      expect(screen.getByText('Bé Sóc')).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Bé gái')).toBeInTheDocument();
    expect(within(table).getByText('Bé trai')).toBeInTheDocument();
    expect(within(table).getByText('Đang hiển thị')).toBeInTheDocument();
    expect(within(table).getByText('Đã xóa bởi phụ huynh')).toBeInTheDocument();
    expect(within(table).queryByText('child-1')).not.toBeInTheDocument();
  });

  it('opens child detail drawer (view-only) when child is clicked', async () => {
    renderWithProviders(<AdminChildManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Bé Bống')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Bé Bống'));

    await waitFor(() => {
      expect(adminApi.getChildDetail).toHaveBeenCalledWith('child-1');
    });

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Chi tiết hồ sơ trẻ')).toBeInTheDocument();
    await waitFor(() => {
      expect(within(dialog).getByText('Thông tin phụ huynh quản lý')).toBeInTheDocument();
    });
    expect(within(dialog).getByText('Vẽ tranh')).toBeInTheDocument();
    expect(within(dialog).getByText('Lắp ráp Lego')).toBeInTheDocument();
    expect(within(dialog).getByText('Khóa do gói Free')).toBeInTheDocument();
    expect(within(dialog).queryByText(/Mã bé/)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/child-1/)).not.toBeInTheDocument();
    expect(within(dialog).getByText('Phường Hải Châu, Đà Nẵng')).toBeInTheDocument();
    // A single way to open the parent account
    expect(within(dialog).getAllByRole('button', { name: /tài khoản phụ huynh/i })).toHaveLength(1);
  });

  it('shows the status tabs in order, lists every profile by default and filters by tab', async () => {
    renderWithProviders(<AdminChildManagementPage />);

    await waitFor(() => {
      expect(adminApi.getChildren).toHaveBeenCalled();
    });
    expect(adminApi.getChildren.mock.calls[0][0]).not.toHaveProperty('isArchived');

    const tabs = ['Tất cả', 'Chưa xóa', 'Đã xóa', 'Khóa do gói Free'].map((name) =>
      screen.getByRole('button', { name })
    );
    tabs.slice(1).forEach((tab, idx) => {
      expect(tabs[idx].compareDocumentPosition(tab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    fireEvent.click(tabs[1]);
    await waitFor(() => {
      expect(adminApi.getChildren.mock.calls.at(-1)[0]).toEqual(expect.objectContaining({ isArchived: 'false' }));
    });

    fireEvent.click(tabs[3]);
    await waitFor(() => {
      const params = adminApi.getChildren.mock.calls.at(-1)[0];
      expect(params).toEqual(expect.objectContaining({ isPlanLocked: 'true' }));
      expect(params).not.toHaveProperty('isArchived');
      expect(params).not.toHaveProperty('status');
    });

    fireEvent.click(tabs[0]);
    await waitFor(() => {
      const params = adminApi.getChildren.mock.calls.at(-1)[0];
      expect(params).not.toHaveProperty('isArchived');
      expect(params).not.toHaveProperty('isPlanLocked');
    });
  });

  it('sends the age bounds of the chosen age range', async () => {
    renderWithProviders(<AdminChildManagementPage />);
    await waitFor(() => {
      expect(screen.getByText('Bé Bống')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Mọi độ tuổi/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: '4 - 6 tuổi' }));

    await waitFor(() => {
      expect(adminApi.getChildren.mock.calls.at(-1)[0]).toEqual(
        expect.objectContaining({ minAge: 4, maxAge: 6 })
      );
    });
  });
});

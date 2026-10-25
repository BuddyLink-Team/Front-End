import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { AdminUserManagementPage } from '../../modules/admin/pages/AdminUserManagementPage';
import { AdminChildManagementPage } from '../../modules/admin/pages/AdminChildManagementPage';
import { adminApi } from '../../modules/admin/api/adminApi';

vi.mock('../../modules/admin/api/adminApi', () => ({
  adminApi: {
    getUsers: vi.fn(),
    getUserDetail: vi.fn(),
    updateUserStatus: vi.fn(),
    getChildren: vi.fn(),
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
      parentId: 'parent-1',
      verification: {
        isVerifiedParent: true,
        phoneVerified: true,
        emailVerified: true,
        identityVerified: true,
      },
      childrenCount: 2,
      currentPlan: {
        planCode: 'premium_monthly',
        status: 'active',
        startDate: '2026-01-01',
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
      parentId: 'parent-2',
      verification: {
        isVerifiedParent: false,
        phoneVerified: false,
        emailVerified: true,
        identityVerified: false,
      },
      childrenCount: 1,
      currentPlan: {
        planCode: 'free',
        status: 'active',
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
  fullName: 'Nguyễn Văn Phụ Huynh',
  email: 'parent1@example.com',
  phone: '0901234567',
  role: 'parent',
  isActive: true,
  avatar: '',
  city: 'Hồ Chí Minh',
  parentId: 'parent-1',
  bio: 'Yêu thích kết nối các hoạt động cho trẻ',
  address: 'Quận 1, TP. HCM',
  verification: {
    isVerifiedParent: true,
    isPhoneVerified: true,
    isEmailVerified: true,
    isIdentityVerified: true,
  },
  children: [
    {
      id: 'child-1',
      displayName: 'Bé Bống',
      age: 5,
      gender: 'girl',
      interests: ['Vẽ tranh', 'Bơi lội'],
    },
  ],
  currentPlan: {
    planCode: 'premium_monthly',
    status: 'active',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
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
      status: 'PAID',
      planCode: 'premium_monthly',
      paidAt: '2026-01-01T10:00:00.000Z',
      createdAt: '2026-01-01T09:55:00.000Z',
    },
  ],
  pagination: {
    page: 1,
    limit: 5,
    total: 1,
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
      parentId: 'parent-1',
      parentName: 'Nguyễn Văn Phụ Huynh',
      isArchived: false,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: 'child-2',
      displayName: 'Bé Sóc',
      birthDate: '2020-03-10',
      age: 6,
      gender: 'boy',
      parentId: 'parent-2',
      parentName: 'Trần Thị Mẹ',
      isArchived: true,
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
  birthDate: '2021-05-15',
  age: 5,
  gender: 'girl',
  personalityTraits: ['Hòa đồng', 'Sáng tạo'],
  interests: ['Vẽ tranh', 'Bơi lội'],
  favoriteActivities: ['Đọc sách', 'Lắp ráp Lego'],
  parent: {
    id: 'parent-1',
    userId: 'user-1',
    fullName: 'Nguyễn Văn Phụ Huynh',
    email: 'parent1@example.com',
    phone: '0901234567',
    city: 'Hồ Chí Minh',
    isParentActive: true,
    isVerifiedParent: true,
  },
  isArchived: false,
  createdAt: '2026-01-02T00:00:00.000Z',
};

describe('AdminUserManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getUsers.mockResolvedValue(mockUsersResponse);
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

  it('opens confirmation dialog when lock icon is clicked and locks account with reason', async () => {
    renderWithProviders(<AdminUserManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Phụ Huynh')).toBeInTheDocument();
    });

    // Find the lock button for the active user
    const lockButtons = screen.getAllByTitle('Khóa tài khoản');
    expect(lockButtons.length).toBeGreaterThan(0);
    fireEvent.click(lockButtons[0]);

    // Dialog appears
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Khóa tài khoản phụ huynh')).toBeInTheDocument();
    const reasonInput = within(dialog).getByPlaceholderText('Nhập lý do khóa tài khoản (tùy chọn)...');
    fireEvent.change(reasonInput, { target: { value: 'Vi phạm quy tắc an toàn' } });

    // Confirm inside the dialog
    const confirmBtn = within(dialog).getByRole('button', { name: 'Khóa tài khoản' });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(adminApi.updateUserStatus).toHaveBeenCalledWith('user-1', {
        isActive: false,
        reason: 'Vi phạm quy tắc an toàn',
      });
      expect(adminApi.getUsers).toHaveBeenCalledTimes(2); // Initial + refetch
    });
  });
});

describe('AdminChildManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getChildren.mockResolvedValue(mockChildrenResponse);
    adminApi.getChildDetail.mockResolvedValue(mockChildDetailResponse);
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
    expect(within(dialog).getByText('Thông tin Phụ huynh quản lý')).toBeInTheDocument();
    expect(within(dialog).getByText('Vẽ tranh')).toBeInTheDocument();
    expect(within(dialog).getByText('Lắp ráp Lego')).toBeInTheDocument();
  });
});

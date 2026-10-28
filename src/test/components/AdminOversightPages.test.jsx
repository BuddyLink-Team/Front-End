import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '../utils/testUtils';
import { AdminPlaydateManagementPage } from '../../modules/admin/pages/AdminPlaydateManagementPage';
import { AdminConnectionManagementPage } from '../../modules/admin/pages/AdminConnectionManagementPage';
import { adminApi } from '../../modules/admin/api/adminApi';

const toastMock = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('../../hooks/useToast', () => ({ useToast: () => toastMock }));

vi.mock('../../modules/admin/api/adminApi', () => ({
  adminApi: {
    getPlaydates: vi.fn(),
    getPlaydateStats: vi.fn(),
    getPlaydateDetail: vi.fn(),
    cancelPlaydate: vi.fn(),
    getConnections: vi.fn(),
    getConnectionStats: vi.fn(),
    getConnectionDetail: vi.fn(),
    removeConnection: vi.fn(),
  },
}));

const mockPlaydatesResponse = {
  success: true,
  data: {
    items: [
      {
        id: 'pd-1',
        activity: 'Lego Building Fun',
        scheduledDate: '2026-11-20T10:00:00.000Z',
        time: '10:00',
        locationName: 'Kids World Da Nang',
        host: {
          parent: { id: 'p-1', fullName: 'Mẹ Lan', isVerified: true },
          child: { id: 'c-1', displayName: 'Bé Bơ' },
        },
        numberOfParticipants: 2,
        status: 'upcoming',
        createdAt: '2026-10-20T10:00:00.000Z',
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  },
};

const mockPlaydateDetailResponse = {
  success: true,
  data: {
    id: 'pd-1',
    activity: 'Lego Building Fun',
    scheduledDate: '2026-11-20T10:00:00.000Z',
    time: '10:00',
    durationMinutes: 120,
    location: {
      name: 'Kids World Da Nang',
      address: '123 Nguyen Van Linh',
    },
    note: 'Nhớ mang theo nước uống',
    status: 'upcoming',
    host: {
      parent: { id: 'p-1', fullName: 'Mẹ Lan', isVerified: true },
      child: { id: 'c-1', displayName: 'Bé Bơ' },
    },
    participants: [
      {
        parentId: 'p-2',
        parent: { id: 'p-2', fullName: 'Bố Tuấn' },
        childId: 'c-2',
        child: { id: 'c-2', displayName: 'Bé Tít' },
        status: 'accepted',
        respondedAt: '2026-10-21T10:00:00.000Z',
      },
    ],
    numberOfParticipants: 1,
    cancellation: null,
    pendingReschedule: null,
  },
};

const mockConnectionsResponse = {
  success: true,
  data: {
    items: [
      {
        id: 'conn-1',
        requester: {
          id: 'p-1',
          fullName: 'Mẹ Lan',
          email: 'lan@test.com',
          isActive: true,
          isVerified: true,
        },
        recipient: {
          id: 'p-2',
          fullName: 'Bố Tuấn',
          email: 'tuan@test.com',
          isActive: true,
          isVerified: false,
        },
        status: 'pending',
        createdAt: '2026-10-20T08:00:00.000Z',
        connectedAt: null,
        declinedAt: null,
        removedAt: null,
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    },
  },
};

const mockConnectionDetailResponse = {
  success: true,
  data: {
    id: 'conn-1',
    requester: {
      id: 'p-1',
      fullName: 'Mẹ Lan',
      email: 'lan@test.com',
      isActive: true,
      isVerified: true,
      location: { area: 'Hải Châu', city: 'Đà Nẵng' },
      bio: 'Yêu trẻ, thích dã ngoại',
    },
    recipient: {
      id: 'p-2',
      fullName: 'Bố Tuấn',
      email: 'tuan@test.com',
      isActive: true,
      isVerified: false,
      location: { area: 'Sơn Trà', city: 'Đà Nẵng' },
    },
    status: 'pending',
    createdAt: '2026-10-20T08:00:00.000Z',
    connectedAt: null,
    declinedAt: null,
    removedAt: null,
    childPairs: [
      {
        children: [
          { id: 'c-1', parentId: 'p-1', displayName: 'Bé Bơ', age: 4, gender: 'boy', isArchived: false },
          { id: 'c-2', parentId: 'p-2', displayName: 'Bé Tít', age: 3, gender: 'girl', isArchived: false },
        ],
        source: 'discovery',
        matchScore: 88,
        createdAt: '2026-10-19T08:00:00.000Z',
      },
    ],
  },
};

describe('AdminPlaydateManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getPlaydates.mockResolvedValue(mockPlaydatesResponse);
    adminApi.getPlaydateStats.mockResolvedValue({ success: true, data: { total: 1234, upcoming: 40, completed: 1100, cancelled: 94 } });
    adminApi.getPlaydateDetail.mockResolvedValue(mockPlaydateDetailResponse);
  });

  it('shows the platform-wide playdate counts above the list', async () => {
    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    expect(await screen.findByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('Tổng cuộc hẹn')).toBeInTheDocument();
    expect(screen.getByText('1.100')).toBeInTheDocument();
  });

  it('tells that the list could not be loaded instead of showing an empty result', async () => {
    adminApi.getPlaydates.mockRejectedValue({ error: { code: 'INTERNAL_ERROR' } });
    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    expect(await screen.findByText('Không tải được danh sách')).toBeInTheDocument();
    expect(screen.queryByText('Không tìm thấy cuộc hẹn chơi nào')).not.toBeInTheDocument();
  });

  it('shows a skeleton while the playdate detail loads', async () => {
    adminApi.getPlaydateDetail.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    await waitFor(() => {
      expect(screen.getByText('Lego Building Fun')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /xem/i }));

    expect(await screen.findByTestId('playdate-detail-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Đang tải...')).not.toBeInTheDocument();
  });

  it('shows the system as the canceller when nobody cancelled the playdate', async () => {
    adminApi.getPlaydateDetail.mockResolvedValue({
      success: true,
      data: {
        ...mockPlaydateDetailResponse.data,
        status: 'cancelled',
        cancellation: { cancelledBy: null, cancelledByAdmin: false, reason: 'Không ai tham gia', cancelledAt: '2026-11-20T00:00:00.000Z' },
      },
    });
    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    await waitFor(() => {
      expect(screen.getByText('Lego Building Fun')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /xem/i }));

    expect(await screen.findByText('Hệ thống tự hủy (không ai tham gia)')).toBeInTheDocument();
  });

  it('renders table with playdates list and opens detail modal on click', async () => {
    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    expect(screen.getByText('Quản lý cuộc hẹn chơi')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Lego Building Fun')).toBeInTheDocument();
    });

    // Click on detail button
    const viewButton = screen.getByRole('button', { name: /xem/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(adminApi.getPlaydateDetail).toHaveBeenCalledWith('pd-1');
      expect(screen.getByText('Chi tiết cuộc hẹn chơi')).toBeInTheDocument();
      expect(screen.getByText('Gia đình chủ trì (Host)')).toBeInTheDocument();
      expect(screen.getByText('Danh sách khách mời (1)')).toBeInTheDocument();
    });
  });

  it('opens cancel confirm dialog and calls cancelPlaydate API', async () => {
    adminApi.cancelPlaydate.mockResolvedValue({ success: true });

    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    await waitFor(() => {
      expect(screen.getByText('Lego Building Fun')).toBeInTheDocument();
    });

    const cancelButton = screen.getByTitle('Hủy cuộc hẹn');
    fireEvent.click(cancelButton);

    expect(screen.getByText('Buộc hủy cuộc hẹn chơi này?')).toBeInTheDocument();
    const reasonInput = screen.getByLabelText(/lý do hủy cuộc hẹn \*/i);
    fireEvent.change(reasonInput, { target: { value: 'Vi phạm an toàn' } });

    const confirmButton = screen.getByRole('button', { name: /xác nhận hủy/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminApi.cancelPlaydate).toHaveBeenCalledWith('pd-1', 'Vi phạm an toàn');
    });
    // Counts follow the status change
    await waitFor(() => {
      expect(adminApi.getPlaydateStats).toHaveBeenCalledTimes(2);
    });
  });

  it('shows the Vietnamese message of a backend error code when cancelling fails', async () => {
    adminApi.cancelPlaydate.mockRejectedValue({ error: { code: 'ALREADY_CANCELLED' }, message: 'This playdate is already cancelled' });

    renderWithProviders(<AdminPlaydateManagementPage />, { route: '/admin/playdates' });

    await waitFor(() => {
      expect(screen.getByText('Lego Building Fun')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Hủy cuộc hẹn'));
    fireEvent.change(screen.getByLabelText(/lý do hủy cuộc hẹn \*/i), { target: { value: 'Vi phạm an toàn' } });
    fireEvent.click(screen.getByRole('button', { name: /xác nhận hủy/i }));

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith('Cuộc hẹn chơi này đã bị hủy trước đó.');
    });
  });
});

describe('AdminConnectionManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getConnections.mockResolvedValue(mockConnectionsResponse);
    adminApi.getConnectionStats.mockResolvedValue({ success: true, data: { total: 320, pending: 12, accepted: 280, declined: 8, removed: 20 } });
    adminApi.getConnectionDetail.mockResolvedValue(mockConnectionDetailResponse);
  });

  it('renders table with connections list and opens detail modal on click', async () => {
    renderWithProviders(<AdminConnectionManagementPage />, { route: '/admin/connections' });

    expect(screen.getByText('Quản lý kết nối')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('lan@test.com')).toBeInTheDocument();
      expect(screen.getByText('tuan@test.com')).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', { name: /xem/i });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(adminApi.getConnectionDetail).toHaveBeenCalledWith('conn-1');
      expect(screen.getByText('Chi tiết mối quan hệ kết nối')).toBeInTheDocument();
      expect(screen.getByText('Phụ huynh gửi lời mời')).toBeInTheDocument();
      expect(screen.getByText('Phụ huynh nhận lời mời')).toBeInTheDocument();
    });

    // Matched children with their parents
    expect(screen.getByText('Bé Bơ')).toBeInTheDocument();
    expect(screen.getByText(/Bé gái • Con của Bố Tuấn/)).toBeInTheDocument();

    // Links to the parents screen, which opens this parent's drawer
    const accountLinks = screen.getAllByRole('link', { name: /xem tài khoản/i });
    expect(accountLinks[0]).toHaveAttribute('href', '/admin/users');
  });

  it('shows the platform-wide connection counts above the list', async () => {
    renderWithProviders(<AdminConnectionManagementPage />, { route: '/admin/connections' });

    expect(await screen.findByText('Tổng kết nối')).toBeInTheDocument();
    expect(await screen.findByText('280')).toBeInTheDocument();
  });

  it('tells that the list could not be loaded instead of showing an empty result', async () => {
    adminApi.getConnections.mockRejectedValue({ error: { code: 'INTERNAL_ERROR' } });
    renderWithProviders(<AdminConnectionManagementPage />, { route: '/admin/connections' });

    expect(await screen.findByText('Không tải được danh sách')).toBeInTheDocument();
    expect(screen.queryByText('Không tìm thấy mối kết nối nào')).not.toBeInTheDocument();
  });

  it('opens remove confirm dialog and calls removeConnection API', async () => {
    adminApi.removeConnection.mockResolvedValue({ success: true });

    renderWithProviders(<AdminConnectionManagementPage />, { route: '/admin/connections' });

    await waitFor(() => {
      expect(screen.getByText('lan@test.com')).toBeInTheDocument();
    });

    const removeButton = screen.getByTitle('Gỡ kết nối');
    fireEvent.click(removeButton);

    expect(screen.getByText('Gỡ mối quan hệ kết nối này?')).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /xác nhận gỡ/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminApi.removeConnection).toHaveBeenCalledWith('conn-1', '');
    });
  });
});

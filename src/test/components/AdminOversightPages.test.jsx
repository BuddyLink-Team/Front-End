import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminPlaydateManagementPage } from '../../modules/admin/pages/AdminPlaydateManagementPage';
import { AdminConnectionManagementPage } from '../../modules/admin/pages/AdminConnectionManagementPage';
import adminApi from '../../modules/admin/api/adminApi';

vi.mock('../../modules/admin/api/adminApi');

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
  },
};

describe('AdminPlaydateManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getPlaydates.mockResolvedValue(mockPlaydatesResponse);
    adminApi.getPlaydateDetail.mockResolvedValue(mockPlaydateDetailResponse);
  });

  it('renders table with playdates list and opens detail modal on click', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/playdates']}>
        <AdminPlaydateManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Quản lý cuộc hẹn chơi (Playdates)')).toBeInTheDocument();
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

    render(
      <MemoryRouter initialEntries={['/admin/playdates']}>
        <AdminPlaydateManagementPage />
      </MemoryRouter>
    );

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
  });
});

describe('AdminConnectionManagementPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.getConnections.mockResolvedValue(mockConnectionsResponse);
    adminApi.getConnectionDetail.mockResolvedValue(mockConnectionDetailResponse);
  });

  it('renders table with connections list and opens detail modal on click', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/connections']}>
        <AdminConnectionManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Quản lý kết nối (Connections)')).toBeInTheDocument();
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
  });

  it('opens remove confirm dialog and calls removeConnection API', async () => {
    adminApi.removeConnection.mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={['/admin/connections']}>
        <AdminConnectionManagementPage />
      </MemoryRouter>
    );

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

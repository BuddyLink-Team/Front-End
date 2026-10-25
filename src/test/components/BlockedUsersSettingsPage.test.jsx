import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BlockedUsersSettingsPage } from '../../modules/safety/pages/BlockedUsersSettingsPage';

const mockFetchBlockedUsers = vi.fn();
const mockUnblockUser = vi.fn();

let mockSafetyState = {
  fetchBlockedUsers: mockFetchBlockedUsers,
  unblockUser: mockUnblockUser,
  blockedUsers: {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  },
  isLoadingBlockedUsers: false,
  isSubmitting: false,
  blockedUsersError: null,
};

vi.mock('../../modules/safety/hooks/useSafetyActions', () => ({
  useSafetyActions: () => mockSafetyState,
}));

vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('BlockedUsersSettingsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchBlockedUsers.mockResolvedValue({});
    mockUnblockUser.mockResolvedValue({ success: true });
    mockSafetyState = {
      fetchBlockedUsers: mockFetchBlockedUsers,
      unblockUser: mockUnblockUser,
      blockedUsers: {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
      },
      isLoadingBlockedUsers: false,
      isSubmitting: false,
      blockedUsersError: null,
    };
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <BlockedUsersSettingsPage />
      </MemoryRouter>,
    );
  };

  it('renders loading state when fetching blocked users', () => {
    mockSafetyState.isLoadingBlockedUsers = true;
    renderPage();

    expect(screen.getByText('Đang tải danh sách người dùng đã chặn...')).toBeInTheDocument();
  });

  it('renders empty state when there are no blocked users', () => {
    mockSafetyState.blockedUsers = { items: [], pagination: { total: 0 } };
    renderPage();

    expect(screen.getByText('Bạn chưa chặn phụ huynh nào')).toBeInTheDocument();
    expect(screen.getByText('Khám phá bạn chơi mới')).toBeInTheDocument();
  });

  it('renders list of blocked users with details and unblock button', () => {
    mockSafetyState.blockedUsers = {
      items: [
        {
          id: 'b-1',
          parentId: 'p-1',
          displayName: 'Phụ huynh Minh Hùng',
          fullName: 'Minh Hùng',
          reason: 'Quấy rối tin nhắn',
          blockedAt: '2026-10-20T10:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    renderPage();

    expect(screen.getByText('Phụ huynh Minh Hùng')).toBeInTheDocument();
    expect(screen.getByText(/Lý do: Quấy rối tin nhắn/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã chặn ngày 20\/10\/2026/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bỏ chặn/i })).toBeInTheDocument();
  });

  it('opens confirm dialog when clicking Bỏ chặn and calls unblockUser upon confirmation', async () => {
    mockSafetyState.blockedUsers = {
      items: [
        {
          id: 'b-1',
          parentId: 'p-1',
          displayName: 'Phụ huynh Minh Hùng',
          reason: 'Quấy rối tin nhắn',
        },
      ],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    renderPage();

    const unblockBtn = screen.getByRole('button', { name: /Bỏ chặn/i });
    fireEvent.click(unblockBtn);

    // ConfirmDialog opens
    expect(screen.getByText('Bỏ chặn Phụ huynh Minh Hùng?')).toBeInTheDocument();

    // Click confirm in dialog
    const confirmBtn = screen.getAllByRole('button', { name: /Bỏ chặn/i })[1];
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockUnblockUser).toHaveBeenCalledWith('p-1', 'Phụ huynh Minh Hùng');
    });
  });
});

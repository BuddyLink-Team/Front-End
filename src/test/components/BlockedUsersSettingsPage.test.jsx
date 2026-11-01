import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BlockedUsersSettingsPage } from '../../modules/safety/pages/BlockedUsersSettingsPage';

const mockUnblock = vi.fn();
const mockSetSearch = vi.fn();
const mockReload = vi.fn();

const baseState = () => ({
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  page: 1,
  setPage: vi.fn(),
  search: '',
  setSearch: mockSetSearch,
  isSearching: false,
  isLoading: false,
  errorMessage: null,
  isSubmitting: false,
  reload: mockReload,
  unblock: mockUnblock,
});

let mockState = baseState();

vi.mock('../../modules/safety/hooks/useBlockedUsers', () => ({
  useBlockedUsers: () => mockState,
}));

const BLOCKED_USER = {
  id: 'b-1',
  parentId: 'p-1',
  fullName: 'Phụ huynh Minh Hùng',
  reason: 'Quấy rối tin nhắn',
  blockedAt: '2026-10-20T10:00:00.000Z',
};

describe('BlockedUsersSettingsPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnblock.mockResolvedValue({ success: true });
    mockState = baseState();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <BlockedUsersSettingsPage />
      </MemoryRouter>,
    );

  it('renders loading state when fetching blocked users', () => {
    mockState.isLoading = true;
    renderPage();

    expect(screen.getByText('Đang tải danh sách người dùng đã chặn...')).toBeInTheDocument();
  });

  it('shows the mapped load error with a retry action', () => {
    mockState.errorMessage = 'Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.';
    renderPage();

    expect(screen.getByText('Thông tin chưa hợp lệ. Vui lòng kiểm tra lại.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(mockReload).toHaveBeenCalled();
  });

  it('renders empty state when there are no blocked users', () => {
    renderPage();

    expect(screen.getByText('Bạn chưa chặn phụ huynh nào')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Khám phá bạn chơi mới' })).toBeInTheDocument();
  });

  it('shows a no-result state for a search and clears it', () => {
    mockState.search = 'abc';
    mockState.isSearching = true;
    renderPage();

    expect(screen.getByText('Không tìm thấy kết quả phù hợp')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tìm kiếm' }));
    expect(mockSetSearch).toHaveBeenCalledWith('');
  });

  it('sends the typed keyword to the server-side search', () => {
    mockState.items = [BLOCKED_USER];
    mockState.pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };
    renderPage();

    fireEvent.change(screen.getByPlaceholderText('Tìm kiếm theo tên phụ huynh...'), { target: { value: 'Hùng' } });
    expect(mockSetSearch).toHaveBeenCalledWith('Hùng');
  });

  it('renders list of blocked users with details and unblock button', () => {
    mockState.items = [BLOCKED_USER];
    mockState.pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };
    renderPage();

    expect(screen.getByText('Phụ huynh Minh Hùng')).toBeInTheDocument();
    expect(screen.getByText(/Lý do: Quấy rối tin nhắn/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã chặn ngày 20\/10\/2026/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bỏ chặn/i })).toBeInTheDocument();
  });

  it('opens confirm dialog when clicking Bỏ chặn and unblocks upon confirmation', async () => {
    mockState.items = [BLOCKED_USER];
    mockState.pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Bỏ chặn/i }));
    expect(screen.getByText('Bỏ chặn Phụ huynh Minh Hùng?')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Bỏ chặn/i })[1]);

    await waitFor(() => {
      expect(mockUnblock).toHaveBeenCalledWith(BLOCKED_USER);
    });
  });
});

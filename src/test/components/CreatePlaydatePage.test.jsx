import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '../utils/testUtils';
import { CreatePlaydatePage } from '../../modules/playdate/pages/CreatePlaydatePage';
import { childApi } from '../../modules/child/api/childApi';
import { playdateApi } from '../../modules/playdate/api/playdateApi';

vi.mock('../../modules/child/api/childApi', () => ({
  childApi: {
    getMyChildren: vi.fn(),
  },
}));

vi.mock('../../modules/playdate/api/playdateApi', () => ({
  playdateApi: {
    getFriends: vi.fn(),
    createPlaydate: vi.fn(),
  },
}));

describe('CreatePlaydatePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    childApi.getMyChildren.mockResolvedValue({
      data: [
        {
          _id: 'child-1',
          displayName: 'Bé Bắp',
          gender: 'boy',
          interests: ['Lego', 'Bóng đá'],
        },
      ],
    });
    playdateApi.getFriends.mockResolvedValue({
      data: [
        {
          id: 'friend-1',
          fullName: 'Mẹ Lan Anh',
          avatarUrl: '',
          isVerified: true,
          children: [
            { id: 'fchild-1', displayName: 'Bé Sóc', gender: 'girl' },
          ],
        },
      ],
    });
  });

  it('renders form title, quota badge, and main sections', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    expect(screen.getByText('Tạo cuộc hẹn chơi mới')).toBeInTheDocument();
    expect(screen.getByText(/Tối đa 3 cuộc hẹn\/tháng/i)).toBeInTheDocument();

    // Verify sections
    expect(screen.getByText(/1\. Chọn bé tham gia của bạn/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Mời gia đình bạn bè tham gia/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Hoạt động & Gợi ý hoạt động nhanh/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Bộ chọn ngày & giờ thân thiện/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Địa điểm hẹn chơi/i)).toBeInTheDocument();

    // Verify child loaded
    await waitFor(() => {
      expect(screen.getByText('Bé Bắp')).toBeInTheDocument();
    });
  });

  it('allows clicking quick activity suggestion chip to auto-populate input', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const legoChip = screen.getByText('Xếp hình Lego 🧩');
    fireEvent.click(legoChip);

    const activityInput = screen.getByPlaceholderText(/nhập tên hoạt động hoặc buổi hẹn/i);
    expect(activityInput.value).toBe('Buổi chơi xếp hình Lego & giao lưu');
  });

  it('opens nearby venues modal when clicking "Tìm kiếm địa điểm lân cận"', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const searchNearbyBtn = screen.getByRole('button', { name: /tìm kiếm địa điểm lân cận/i });
    fireEvent.click(searchNearbyBtn);

    expect(screen.getByText('Địa điểm gợi ý lân cận')).toBeInTheDocument();
    expect(screen.getByText('Công viên Gia Định')).toBeInTheDocument();
    expect(screen.getByText('Công viên Cầu Ánh Sao - Hồ Bán Nguyệt')).toBeInTheDocument();
  });

  it('shows error validation when submitting without required fields', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const submitBtn = screen.getByRole('button', { name: /tạo lời mời & buổi hẹn/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/vui lòng nhập tên hoạt động hoặc chọn từ gợi ý/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng chọn ngày diễn ra/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng chọn hoặc nhập khung giờ/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng nhập đầy đủ tên địa điểm và địa chỉ/i)).toBeInTheDocument();
    });
  });

  it('renders unlimited quota badge when user is premium', async () => {
    renderWithProviders(<CreatePlaydatePage />, {
      preloadedState: {
        auth: { user: { isPremium: true, subscriptionTier: 'premium' } },
      },
    });

    expect(screen.getByText(/Gói Premium:/i)).toBeInTheDocument();
    expect(screen.getByText(/Không giới hạn cuộc hẹn/i)).toBeInTheDocument();
    expect(screen.queryByText(/Tối đa 3 cuộc hẹn\/tháng/i)).not.toBeInTheDocument();
  });
});

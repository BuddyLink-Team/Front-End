import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '../utils/testUtils';
import { CreatePlaydatePage } from '../../modules/playdate/pages/CreatePlaydatePage';
import { childApi } from '../../modules/child/api/childApi';
import { playdateApi } from '../../modules/playdate/api/playdateApi';
import { subscriptionApi } from '../../modules/subscription/api/subscriptionApi';

vi.mock('../../modules/child/api/childApi', () => ({
  childApi: {
    getMyChildren: vi.fn(),
  },
}));

vi.mock('../../modules/playdate/api/playdateApi', () => ({
  playdateApi: {
    getFriends: vi.fn(),
    createPlaydate: vi.fn(),
    getNearbyPlaces: vi.fn(),
  },
}));

vi.mock('../../modules/subscription/api/subscriptionApi', () => ({
  subscriptionApi: {
    getMySubscriptionQuota: vi.fn(),
  },
}));

const quotaResponse = (playdatesCreatedPerMonth) => ({
  data: { subscription: null, quota: { limits: { playdatesCreatedPerMonth }, usage: {} } },
});

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
          favoriteActivities: ['Xếp hình Lego'],
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
    playdateApi.getNearbyPlaces.mockResolvedValue({
      data: [
        {
          id: 'place-1',
          name: 'Công viên Biển Đông',
          address: 'Võ Nguyên Giáp, Phường Phước Mỹ, Đà Nẵng',
          placeType: 'park',
          coordinates: [108.2475, 16.0717],
          distanceMeters: 1200,
        },
      ],
    });
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(3));
  });

  it('renders form title, quota badge, and main sections', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    expect(screen.getByText('Tạo cuộc hẹn chơi mới')).toBeInTheDocument();
    // Summary panel (desktop) and action bar (mobile) both show the quota
    expect(screen.getAllByText(/Tối đa 3 cuộc hẹn\/tháng/i).length).toBeGreaterThan(0);

    // Sections, required ones first
    const sections = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(sections).toEqual([
      'Bé tham gia *',
      'Hoạt động *',
      'Thời gian *',
      'Địa điểm *',
      'Mời bạn bè (tùy chọn)',
      'Ghi chú (tùy chọn)',
    ]);

    // Child loaded and selected by default (child card + summary panel)
    await waitFor(() => {
      expect(screen.getAllByText('Bé Bắp')).toHaveLength(2);
    });
  });

  it('suggests the host child favorite activities first and fills the input', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    // Bé Bắp likes Lego: first suggestion once the child is loaded
    const legoChip = await screen.findByRole('button', { name: /xếp hình lego/i });
    const chips = screen.getByRole('button', { name: /xem tất cả \d+ hoạt động/i }).previousElementSibling;
    expect(chips.querySelector('button')).toBe(legoChip);
    fireEvent.click(legoChip);

    const activityInput = screen.getByPlaceholderText(/buổi chơi lego cuối tuần/i);
    expect(activityInput.value).toBe('Buổi chơi xếp hình Lego & giao lưu');
  });

  it('opens nearby venues modal when clicking "Tìm địa điểm cho bé"', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const searchNearbyBtn = screen.getByRole('button', { name: /tìm địa điểm cho bé/i });
    fireEvent.click(searchNearbyBtn);

    expect(screen.getByText('Địa điểm gợi ý lân cận')).toBeInTheDocument();
    // Suggestions come from GET /places/nearby
    expect(await screen.findByText('Công viên Biển Đông')).toBeInTheDocument();
    expect(playdateApi.getNearbyPlaces).toHaveBeenCalled();
  });

  it('shows error validation when submitting without required fields', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const [submitBtn] = screen.getAllByRole('button', { name: /tạo buổi hẹn/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/vui lòng nhập tên hoạt động hoặc chọn từ gợi ý/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng chọn ngày diễn ra/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng chọn giờ hẹn/i)).toBeInTheDocument();
      expect(screen.getByText(/vui lòng nhập đầy đủ tên địa điểm và địa chỉ/i)).toBeInTheDocument();
    });
  });

  it('renders unlimited quota badge when the plan has no playdate limit', async () => {
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(-1));
    renderWithProviders(<CreatePlaydatePage />);

    expect((await screen.findAllByText(/Gói Premium: không giới hạn cuộc hẹn/i)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Tối đa 3 cuộc hẹn\/tháng/i)).not.toBeInTheDocument();
  });
});

describe('CreatePlaydatePage quota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    childApi.getMyChildren.mockResolvedValue({ data: [] });
    playdateApi.getFriends.mockResolvedValue({ data: [] });
  });

  it('shows the limit of the current plan', async () => {
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(5));
    renderWithProviders(<CreatePlaydatePage />);

    expect((await screen.findAllByText(/Tối đa 5 cuộc hẹn\/tháng/i)).length).toBeGreaterThan(0);
  });
});

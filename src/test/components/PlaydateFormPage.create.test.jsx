import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { PlaydateFormPage as CreatePlaydatePage } from '../../modules/playdate/pages/PlaydateFormPage';
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
    getPlaceById: vi.fn(),
    getTimeSlotSuggestions: vi.fn(),
    getPlaceSuggestions: vi.fn(),
    getActivitySuggestions: vi.fn(),
    getBusyTimes: vi.fn(),
  },
}));

vi.mock('../../modules/subscription/api/subscriptionApi', () => ({
  subscriptionApi: {
    getMySubscriptionQuota: vi.fn(),
  },
}));

// GET /subscriptions/my: usage per feature (-1 = unlimited)
const quotaResponse = (playdatesCreatedPerMonth) => ({
  data: {
    isPremium: playdatesCreatedPerMonth === -1,
    effectivePlanCode: playdatesCreatedPerMonth === -1 ? 'premium_monthly' : 'free',
    subscription: null,
    usage: { playdates_created: { limit: playdatesCreatedPerMonth, used: 0 } },
  },
});

// GET /playdates/friends?childId=: friends' children ranked for the host child
const playmate = (childId, displayName, parentName, { matchScore = 70, source = null, warnings = [] } = {}) => ({
  parent: { id: `parent-${childId}`, fullName: parentName, avatarUrl: '', isVerified: true, location: { area: '', city: '' } },
  child: { id: childId, displayName, age: 5, gender: 'girl', interests: [] },
  matchScore,
  source,
  warnings,
});

const PLAYMATES = {
  matched: [playmate('fchild-1', 'Bé Sóc', 'Mẹ Lan Anh', { matchScore: 86, source: 'discovery' })],
  others: [
    playmate('fchild-2', 'Bé Tôm', 'Bố Hùng', {
      matchScore: 40,
      warnings: [{ code: 'AGE_GAP', ageGapYears: 4 }],
    }),
  ],
};

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
    playdateApi.getFriends.mockResolvedValue({ data: PLAYMATES });
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
    playdateApi.getTimeSlotSuggestions.mockResolvedValue({
      data: {
        slots: [
          {
            date: '2030-11-02',
            time: '09:00',
            durationMinutes: 120,
            dayType: 'weekend',
            timeSlot: 'morning',
            matchedParents: 2,
            totalParents: 2,
          },
        ],
      },
    });
    playdateApi.getPlaceSuggestions.mockResolvedValue({
      data: {
        places: [
          {
            id: 'place-9',
            placeId: 'osm-node-9',
            name: 'Công viên APEC',
            type: 'park',
            address: 'Bạch Đằng, Đà Nẵng',
            isPreferredType: true,
            familyDistances: [
              { parentId: 'me', label: 'Nhà bạn', area: 'Hải Châu', distanceKm: 1.2 },
              { parentId: 'parent-fchild-1', label: 'Mẹ Lan Anh', area: 'Sơn Trà', distanceKm: 2.4 },
            ],
            coordinates: [108.2465, 16.0614],
            osmUrl: 'https://www.openstreetmap.org/way/9',
          },
        ],
      },
    });
    // Places API details of a place (address resolved, coordinates, opening hours...)
    playdateApi.getPlaceById.mockResolvedValue({
      data: {
        id: 'place-9',
        placeId: 'osm-way-9',
        name: 'Công viên APEC',
        address: '2 Bạch Đằng, Phường Hải Châu, Đà Nẵng',
        placeType: 'park',
        coordinates: [108.2465, 16.0614],
        openingHours: 'Mo-Su 05:00-22:00',
        osmUrl: 'https://www.openstreetmap.org/way/9',
      },
    });
    playdateApi.getActivitySuggestions.mockResolvedValue({
      data: {
        activities: [
          {
            key: 'Xếp hình Lego',
            title: 'Buổi chơi xếp hình Lego & giao lưu',
            placeTypes: ['kids_cafe'],
            durationMinutes: 90,
            sharedCount: 1,
            reason: 'Bé Bắp thích xếp hình lego',
          },
        ],
      },
    });
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(3));
    playdateApi.getBusyTimes.mockResolvedValue({ data: { busy: [] } });
  });

  it('shows the busy times as soon as a date is picked, and blocks a clashing time before submit', async () => {
    const at = (time) => new Date(`2030-11-02T${time}:00`).toISOString();
    playdateApi.getBusyTimes.mockResolvedValue({
      data: {
        busy: [
          { childId: 'child-1', childName: 'Bé Bắp', isOwnChild: true, start: '09:00', end: '11:00', startsAt: at('09:00'), endsAt: at('11:00') },
          { childId: 'fchild-1', childName: 'Bé Sóc', isOwnChild: false, start: '15:00', end: '17:00', startsAt: at('15:00'), endsAt: at('17:00') },
        ],
      },
    });
    renderWithProviders(<CreatePlaydatePage />);
    await waitFor(() => expect(screen.getAllByText('Bé Bắp').length).toBeGreaterThanOrEqual(2));

    fireEvent.change(screen.getByLabelText(/^Ngày/), { target: { value: '2030-11-02' } });
    expect(await screen.findByText(/Lịch bận trong ngày/)).toHaveTextContent('Bé Bắp 09:00–11:00 · Bé Sóc 15:00–17:00');
    expect(playdateApi.getBusyTimes).toHaveBeenLastCalledWith({ childId: 'child-1', date: '2030-11-02' });

    // Own child busy: red, with the next free time to pick
    fireEvent.change(screen.getByLabelText(/^Giờ bắt đầu/), { target: { value: '10:00' } });
    expect(await screen.findByText(/trùng giờ bạn chọn, không thể dùng giờ này/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /chọn 11:00 \(giờ trống gần nhất\)/i }));
    expect(screen.getByLabelText(/^Giờ bắt đầu/).value).toBe('11:00');
    expect(screen.queryByText(/trùng giờ bạn chọn/)).not.toBeInTheDocument();

    // A friend's child busy: a warning only
    fireEvent.change(screen.getByLabelText(/^Giờ bắt đầu/), { target: { value: '16:00' } });
    expect(await screen.findByText(/phụ huynh của bé sẽ chưa nhận lời được/)).toHaveTextContent('Bé Sóc 15:00–17:00');

    // A clashing own-child time is refused before any request
    fireEvent.change(screen.getByLabelText(/^Giờ bắt đầu/), { target: { value: '09:30' } });
    fireEvent.click(await screen.findByRole('button', { name: /chọn công viên apec/i }));
    fireEvent.click(await screen.findByRole('button', { name: /buổi chơi xếp hình lego & giao lưu/i }));
    await screen.findAllByText('Công viên APEC');
    const [submitBtn] = screen.getAllByRole('button', { name: /tạo buổi hẹn/i });
    fireEvent.click(submitBtn);
    expect(await screen.findByText(/bé đã có một buổi hẹn khác trùng giờ này/i)).toBeInTheDocument();
    expect(playdateApi.createPlaydate).not.toHaveBeenCalled();
  });

  it('renders the child-first steps and selects the first child', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    expect(screen.getByText('Tạo cuộc hẹn chơi mới')).toBeInTheDocument();
    // Summary panel (desktop) and action bar (mobile) both show the quota
    expect(screen.getAllByText(/Tối đa 3 cuộc hẹn\/tháng/i).length).toBeGreaterThan(0);

    const sections = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    // Three numbered steps (the number is read by screen readers, shown as a badge)
    expect(sections).toEqual([
      'Bước 1: Bé & bạn chơi *',
      'Bước 2: Thời gian & địa điểm *',
      'Bước 3: Hoạt động & ghi chú *',
    ]);

    // Child loaded and selected by default (child card + summary panel)
    await waitFor(() => {
      expect(screen.getAllByText('Bé Bắp').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('loads the playmates of the selected child, paired ones first, warnings do not block', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    expect(await screen.findByText('Bạn chơi của bé')).toBeInTheDocument();
    expect(playdateApi.getFriends).toHaveBeenCalledWith({ childId: 'child-1' });
    expect(screen.getByText('Đã ghép đôi')).toBeInTheDocument();
    expect(screen.getByText(/Chênh lệch 4 tuổi/)).toBeInTheDocument();

    // A child with a warning can still be invited
    const tom = screen.getByRole('button', { name: /bé tôm/i });
    fireEvent.click(tom);
    expect(tom).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText(/Đã mời 1 bé/).length).toBeGreaterThan(0);

    // Suggestions are reloaded for the host child + the invited child
    await waitFor(() => {
      expect(playdateApi.getActivitySuggestions).toHaveBeenLastCalledWith({
        childId: 'child-1',
        participantChildIds: 'fchild-2',
      });
    });
  });

  it('fills date and time from a suggested slot', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const slot = await screen.findByRole('button', { name: /T7 02\/11 · 09:00/ });
    expect(slot).toHaveTextContent('Hợp với cả các gia đình');
    fireEvent.click(slot);

    expect(screen.getByLabelText(/^Ngày/).value).toBe('2030-11-02');
    expect(screen.getByLabelText(/^Giờ bắt đầu/).value).toBe('09:00');
    // Default duration: 2 hours
    expect(screen.getByText('Kết thúc lúc 11:00')).toBeInTheDocument();
  });

  it('fills the activity from a suggestion with its reason and suggested duration', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const suggestion = await screen.findByRole('button', { name: /buổi chơi xếp hình lego & giao lưu/i });
    expect(suggestion).toHaveTextContent('Bé Bắp thích xếp hình lego · khoảng 1,5 giờ');
    fireEvent.click(suggestion);

    const activityInput = screen.getByPlaceholderText(/buổi chơi lego cuối tuần/i);
    expect(activityInput.value).toBe('Buổi chơi xếp hình Lego & giao lưu');
    // The usual length of the activity replaces the default 2 hours
    expect(screen.getByLabelText('Thời lượng').value).toBe('90');
  });

  it('keeps the duration chosen by the parent and offers the suggested one', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    fireEvent.change(screen.getByLabelText('Thời lượng'), { target: { value: '180' } });
    fireEvent.click(await screen.findByRole('button', { name: /buổi chơi xếp hình lego & giao lưu/i }));

    expect(screen.getByLabelText('Thời lượng').value).toBe('180');
    fireEvent.click(screen.getByRole('button', { name: /dùng thời lượng gợi ý cho hoạt động: 1,5 giờ/i }));
    expect(screen.getByLabelText('Thời lượng').value).toBe('90');
  });

  it('lists every activity in the activity field and still accepts free text', async () => {
    renderWithProviders(<CreatePlaydatePage />);
    await waitFor(() => expect(screen.getAllByText('Bé Bắp').length).toBeGreaterThanOrEqual(2));

    const input = screen.getByPlaceholderText(/buổi chơi lego cuối tuần/i);
    expect(input).toHaveAttribute('role', 'combobox');
    fireEvent.focus(input);
    // The host child's favorite comes first, then every catalog activity by category
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options[0]).toHaveTextContent('Buổi chơi xếp hình Lego & giao lưu');
    expect(options.length).toBeGreaterThanOrEqual(20);

    // Accent-insensitive filter
    fireEvent.change(input, { target: { value: 've tranh' } });
    const [drawing] = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(drawing).toHaveTextContent('Buổi vẽ tranh sáng tạo ngoài trời');
    fireEvent.mouseDown(drawing);
    expect(input.value).toBe('Buổi vẽ tranh sáng tạo ngoài trời');

    // Free text is kept as typed
    fireEvent.change(input, { target: { value: 'Buổi chơi trốn tìm' } });
    expect(input.value).toBe('Buổi chơi trốn tìm');
    expect(screen.getByText(/không có gợi ý phù hợp/i)).toBeInTheDocument();
  });

  it('fills a suggested place from the places API, with a Google Maps link', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    // Distance from each family's ward center, labelled
    expect(await screen.findByText('Cách Nhà bạn 1,2 km · Mẹ Lan Anh 2,4 km')).toBeInTheDocument();

    // Each suggestion can be opened on Google Maps
    const mapsLink = await screen.findByRole('link', { name: /^google maps$/i });
    expect(mapsLink).toHaveAttribute('href', 'https://www.google.com/maps/dir/?api=1&destination=16.0614,108.2465');

    fireEvent.click(screen.getByRole('button', { name: /chọn công viên apec/i }));

    // The place data always comes from the places API details
    expect(await screen.findByText('2 Bạch Đằng, Phường Hải Châu, Đà Nẵng')).toBeInTheDocument();
    expect(playdateApi.getPlaceById).toHaveBeenCalledWith('place-9');
    expect(screen.getByRole('link', { name: /chỉ đường trên google maps/i })).toHaveAttribute(
      'href',
      'https://www.google.com/maps/dir/?api=1&destination=16.0614,108.2465'
    );
  });

  it('opens the details of a suggested place in the place modal', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    fireEvent.click(await screen.findByRole('button', { name: /chi tiết/i }));

    expect(await screen.findByText('Thông tin địa điểm')).toBeInTheDocument();
    expect(await screen.findByText(/Mo-Su 05:00-22:00/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /xem trên openstreetmap/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /chọn địa điểm này/i }));
    expect(await screen.findByText('2 Bạch Đằng, Phường Hải Châu, Đà Nẵng')).toBeInTheDocument();
  });

  it('shows 4 suggestions and the rest behind "Xem thêm"', async () => {
    const slots = Array.from({ length: 6 }, (_, i) => ({
      date: `2030-11-0${i + 1}`,
      time: '09:00',
      durationMinutes: 120,
      dayType: 'weekend',
      timeSlot: 'morning',
      matchedParents: 1,
      totalParents: 1,
    }));
    playdateApi.getTimeSlotSuggestions.mockResolvedValue({ data: { slots } });
    renderWithProviders(<CreatePlaydatePage />);

    const more = await screen.findByRole('button', { name: /xem thêm 2 khung giờ/i });
    expect(screen.getAllByRole('button', { name: /· 09:00/ })).toHaveLength(4);
    fireEvent.click(more);
    expect(screen.getAllByRole('button', { name: /· 09:00/ })).toHaveLength(6);
    expect(screen.getByRole('button', { name: /thu gọn/i })).toBeInTheDocument();
  });

  it('only reloads the time slots when the duration changes', async () => {
    renderWithProviders(<CreatePlaydatePage />);
    await screen.findByRole('button', { name: /T7 02\/11 · 09:00/ });
    const placeCalls = playdateApi.getPlaceSuggestions.mock.calls.length;
    const activityCalls = playdateApi.getActivitySuggestions.mock.calls.length;

    fireEvent.change(screen.getByLabelText('Thời lượng'), { target: { value: '180' } });

    await waitFor(() => {
      expect(playdateApi.getTimeSlotSuggestions).toHaveBeenLastCalledWith(expect.objectContaining({ durationMinutes: 180 }));
    });
    expect(playdateApi.getPlaceSuggestions.mock.calls.length).toBe(placeCalls);
    expect(playdateApi.getActivitySuggestions.mock.calls.length).toBe(activityCalls);
    // The other suggestions stay on screen meanwhile
    expect(screen.getByRole('button', { name: /chọn công viên apec/i })).toBeInTheDocument();
  });

  it('opens nearby venues modal when clicking "Tìm địa điểm khác cho bé"', async () => {
    renderWithProviders(<CreatePlaydatePage />);

    const searchNearbyBtn = screen.getByRole('button', { name: /tìm địa điểm khác cho bé/i });
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

  it('shows a schedule conflict on the time field and sends the duration', async () => {
    playdateApi.createPlaydate.mockRejectedValue({
      success: false,
      message: 'Your child already has a playdate at this time',
      error: { code: 'SCHEDULE_CONFLICT', details: [] },
    });
    renderWithProviders(<CreatePlaydatePage />);

    fireEvent.click(await screen.findByRole('button', { name: /T7 02\/11 · 09:00/ }));
    fireEvent.click(await screen.findByRole('button', { name: /công viên apec/i }));
    fireEvent.click(await screen.findByRole('button', { name: /buổi chơi xếp hình lego & giao lưu/i }));
    fireEvent.change(screen.getByLabelText('Thời lượng'), { target: { value: '90' } });
    await screen.findAllByText('Công viên APEC');

    const [submitBtn] = screen.getAllByRole('button', { name: /tạo buổi hẹn/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(playdateApi.createPlaydate).toHaveBeenCalledWith(
        expect.objectContaining({ hostChildId: 'child-1', time: '09:00', durationMinutes: 90 })
      );
    });
    expect(await screen.findByText(/bé đã có một buổi hẹn khác trùng giờ này/i)).toBeInTheDocument();
  });

  it('renders unlimited quota badge when the plan has no playdate limit', async () => {
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(-1));
    renderWithProviders(<CreatePlaydatePage />);

    expect((await screen.findAllByText(/Gói Premium: không giới hạn cuộc hẹn/i)).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Tối đa 3 cuộc hẹn\/tháng/i)).not.toBeInTheDocument();
  });
});

describe('CreatePlaydatePage invite link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    childApi.getMyChildren.mockResolvedValue({
      data: [
        { _id: 'child-1', displayName: 'Bé Bắp', gender: 'boy' },
        { _id: 'child-2', displayName: 'Bé Na', gender: 'girl' },
      ],
    });
    playdateApi.getFriends.mockResolvedValue({ data: PLAYMATES });
    playdateApi.getTimeSlotSuggestions.mockResolvedValue({ data: { slots: [] } });
    playdateApi.getPlaceSuggestions.mockResolvedValue({ data: { places: [] } });
    playdateApi.getActivitySuggestions.mockResolvedValue({ data: { activities: [] } });
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(3));
  });

  it('preselects the own child and the invited family from the connections page', async () => {
    renderWithProviders(<CreatePlaydatePage />, { route: '/playdates/create?invite=parent-fchild-1&childId=child-2' });

    await waitFor(() => {
      expect(playdateApi.getFriends).toHaveBeenCalledWith({ childId: 'child-2' });
    });
    expect(await screen.findByRole('button', { name: /bé sóc/i })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('CreatePlaydatePage quota', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    childApi.getMyChildren.mockResolvedValue({ data: [] });
    playdateApi.getFriends.mockResolvedValue({ data: { matched: [], others: [] } });
  });

  it('shows the limit of the current plan', async () => {
    subscriptionApi.getMySubscriptionQuota.mockResolvedValue(quotaResponse(5));
    renderWithProviders(<CreatePlaydatePage />);

    expect((await screen.findAllByText(/Tối đa 5 cuộc hẹn\/tháng/i)).length).toBeGreaterThan(0);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor, within } from '../utils/testUtils';
import { PlaydateFormPage as PlaydateDetailPage } from '../../modules/playdate/pages/PlaydateFormPage';
import { playdateApi } from '../../modules/playdate/api/playdateApi';

vi.mock('../../modules/playdate/api/playdateApi', () => ({
  playdateApi: {
    getPlaydateById: vi.fn(),
    getReschedule: vi.fn(),
    completePlaydate: vi.fn(),
    cancelPlaydate: vi.fn(),
    respondToPlaydate: vi.fn(),
    createReschedule: vi.fn(),
    voteReschedule: vi.fn(),
    getNearbyPlaces: vi.fn(),
    getBusyTimes: vi.fn(),
    getFriends: vi.fn(),
    inviteParticipants: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'playdate-test-123' }),
  };
});

const mockHostPlaydate = {
  id: 'playdate-test-123',
  activity: 'Buổi chơi Lego & Công viên',
  scheduledDate: '2026-10-15T08:00:00.000Z',
  time: '15:00',
  location: {
    name: 'Công viên Cầu Ánh Sao',
    address: 'Quận 7, TP. Hồ Chí Minh',
  },
  note: 'Nhớ mang nón và bình nước',
  status: 'upcoming',
  displayStatus: 'confirmed',
  isHost: true,
  myParticipantStatus: 'host',
  chatConversationId: 'conv-123',
  hostParent: {
    id: 'parent-host',
    fullName: 'Mẹ Lan',
    avatarUrl: '',
    isVerified: true,
  },
  hostChild: {
    id: 'child-host',
    displayName: 'Bé Bắp',
    interests: ['Lego'],
  },
  participants: [
    {
      parentId: 'parent-guest-1',
      parent: {
        id: 'parent-guest-1',
        fullName: 'Bố Minh',
        avatarUrl: '',
        isVerified: true,
      },
      child: {
        id: 'child-guest-1',
        displayName: 'Bé Sóc',
      },
      status: 'accepted',
    },
  ],
};

const mockParticipantPlaydate = {
  ...mockHostPlaydate,
  isHost: false,
  myParticipantStatus: 'pending',
  myChildId: 'child-guest-1',
};

describe('PlaydateDetailPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playdateApi.getReschedule.mockResolvedValue({ data: null });
    playdateApi.getBusyTimes.mockResolvedValue({ data: { busy: [] } });
  });

  it('lets the host invite other friends once every invitee declined', async () => {
    const declinedPlaydate = {
      ...mockHostPlaydate,
      hostChildId: 'child-host',
      scheduledDate: '2030-11-02T00:00:00',
      displayStatus: 'awaiting_playmates',
      participants: [{ ...mockHostPlaydate.participants[0], status: 'declined' }],
    };
    playdateApi.getPlaydateById.mockResolvedValue({ data: declinedPlaydate });
    const entry = (parentId, parentName, childId, childName) => ({
      parent: { id: parentId, fullName: parentName, avatarUrl: '' },
      child: { id: childId, displayName: childName, age: 5 },
      matchScore: 70,
      warnings: [],
    });
    playdateApi.getFriends.mockResolvedValue({
      data: {
        matched: [entry('parent-guest-1', 'Bố Minh', 'child-guest-1', 'Bé Sóc')],
        others: [entry('parent-guest-2', 'Mẹ Hoa', 'child-guest-2', 'Bé Thư'), entry('parent-guest-3', 'Bố Nam', 'child-guest-3', 'Bé Tôm')],
      },
    });
    playdateApi.inviteParticipants.mockResolvedValue({
      data: {
        ...declinedPlaydate,
        displayStatus: 'pending',
        participants: [...declinedPlaydate.participants, { parentId: 'parent-guest-2', child: { displayName: 'Bé Thư' }, status: 'pending' }],
        warnings: [],
      },
    });

    renderWithProviders(<PlaydateDetailPage />);

    expect(await screen.findByText('Chưa có bạn tham gia')).toBeInTheDocument();
    expect(screen.getByText(/Hiện chưa có bạn nào tham gia/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mời thêm bạn' }));

    // The family that declined can be invited again; the search ignores accents
    expect(await screen.findByText('Bé Thư')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Bé Sóc/)).toBeInTheDocument();
    expect(playdateApi.getFriends).toHaveBeenCalledWith({ childId: 'child-host', limit: 100 });
    fireEvent.change(screen.getByPlaceholderText('Tìm theo tên bé hoặc phụ huynh'), { target: { value: 'thu' } });
    expect(screen.queryByText('Bé Tôm')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Bé Thư/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Gửi lời mời (1)' }));
    await waitFor(() =>
      expect(playdateApi.inviteParticipants).toHaveBeenCalledWith('playdate-test-123', [
        { parentId: 'parent-guest-2', childId: 'child-guest-2' },
      ])
    );
    // Pending again: the status chip and the new invitee's card
    await waitFor(() => expect(screen.queryByText('Chưa có bạn tham gia')).not.toBeInTheDocument());
    expect(screen.getAllByText('Chờ phản hồi').length).toBeGreaterThanOrEqual(1);
  });

  it('tells an invited parent their child is busy at that time and does not let them accept', async () => {
    const date = '2030-11-02';
    playdateApi.getPlaydateById.mockResolvedValue({
      data: { ...mockParticipantPlaydate, scheduledDate: `${date}T00:00:00`, time: '15:00', durationMinutes: 120 },
    });
    playdateApi.getBusyTimes.mockResolvedValue({
      data: {
        busy: [
          {
            childId: 'child-guest-1',
            childName: 'Bé Sóc',
            isOwnChild: true,
            start: '16:00',
            end: '18:00',
            startsAt: new Date(`${date}T16:00:00`).toISOString(),
            endsAt: new Date(`${date}T18:00:00`).toISOString(),
          },
        ],
      },
    });

    renderWithProviders(<PlaydateDetailPage />);

    expect(await screen.findByText(/Bé Sóc đã có hẹn khác 16:00–18:00, trùng giờ này/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chấp nhận tham gia/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /từ chối/i })).not.toBeDisabled();
    expect(playdateApi.getBusyTimes).toHaveBeenCalledWith({
      childId: 'child-guest-1',
      date,
      excludePlaydateId: 'playdate-test-123',
    });
  });

  it('renders playdate title, time, location, and host badge when user is host', async () => {
    // Started yesterday: the host can mark it completed
    playdateApi.getPlaydateById.mockResolvedValue({
      data: { ...mockHostPlaydate, scheduledDate: new Date(Date.now() - 86400000).toISOString() },
    });

    renderWithProviders(<PlaydateDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Buổi chơi Lego & Công viên' })).toBeInTheDocument();
      expect(screen.getByText('Mẹ Lan')).toBeInTheDocument();
      // Shown in the content and in the summary panel
      expect(screen.getAllByText(/công viên cầu ánh sao/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/15:00/).length).toBeGreaterThan(0);
      expect(screen.getByText(/^người tổ chức$/i)).toBeInTheDocument();
    });

    // The details read like the create form: the same three steps, read-only
    const steps = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(steps).toEqual(['Bước 1: Bé & bạn chơi', 'Bước 2: Thời gian & địa điểm', 'Bước 3: Hoạt động & ghi chú']);
    expect(screen.getByText('2 giờ')).toBeInTheDocument();
    expect(screen.getByText('Nhớ mang nón và bình nước')).toBeInTheDocument();

    // Verify host buttons: Hoàn thành & Hủy hẹn
    expect(screen.getByRole('button', { name: /hoàn thành/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hủy hẹn/i })).toBeInTheDocument();
  });

  it('renders RSVP action banner for pending invited participant', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockParticipantPlaydate });

    renderWithProviders(<PlaydateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/bạn nhận được lời mời tham gia playdate này/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /chấp nhận tham gia/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /từ chối/i })).toBeInTheDocument();
    });
  });

  it('opens reschedule modal when clicking "Đổi lịch hẹn"', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockHostPlaydate });

    renderWithProviders(<PlaydateDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /đổi lịch hẹn/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /đổi lịch hẹn/i }));

    expect(screen.getByText('Đề xuất đổi lịch')).toBeInTheDocument();
    expect(screen.getByText(/tất cả phụ huynh đã tham gia/i)).toBeInTheDocument();
  });

  it('renders active reschedule banner when there is a pending request', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockHostPlaydate });
    playdateApi.getReschedule.mockResolvedValue({
      data: {
        _id: 'resched-1',
        status: 'pending',
        requestedBy: { fullName: 'Bố Minh' },
        reason: 'Cuối tuần mưa lớn dời lịch nhé',
        newDate: '2026-10-22T08:00:00.000Z',
        newStartTime: '16:00',
        newLocation: { name: 'Công viên Gia Định Mới' },
        responses: [
          { parentId: 'parent-host', status: 'pending' },
        ],
      },
    });

    renderWithProviders(<PlaydateDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/đang có đề xuất đổi lịch hẹn mới/i)).toBeInTheDocument();
      expect(screen.getByText(/cuối tuần mưa lớn dời lịch nhé/i)).toBeInTheDocument();
      expect(screen.getByText(/công viên gia định mới/i)).toBeInTheDocument();
    });
  });

  it('does NOT show "Đổi lịch hẹn" button when caller is not the host', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockParticipantPlaydate });

    renderWithProviders(<PlaydateDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Buổi chơi Lego & Công viên' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /đổi lịch hẹn/i })).not.toBeInTheDocument();
  });

  it('lets an invited parent report the playdate (against its host)', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockParticipantPlaydate });

    renderWithProviders(<PlaydateDetailPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Báo cáo buổi hẹn' }));
    expect(await screen.findByText('Buổi hẹn Playdate:')).toBeInTheDocument();
  });

  it('does NOT let the host report their own playdate', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockHostPlaydate });

    renderWithProviders(<PlaydateDetailPage />);

    await screen.findByRole('heading', { level: 1, name: 'Buổi chơi Lego & Công viên' });
    expect(screen.queryByRole('button', { name: 'Báo cáo buổi hẹn' })).not.toBeInTheDocument();
  });

  it('renders vote buttons when the API says the caller still has to vote', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({
      data: { ...mockParticipantPlaydate, myParticipantStatus: 'accepted' },
    });
    playdateApi.getReschedule.mockResolvedValue({
      data: {
        id: 'resched-2',
        status: 'pending',
        requestedBy: { fullName: 'Mẹ Lan' },
        newDate: '2026-10-22T08:00:00.000Z',
        newStartTime: '16:00',
        responses: [{ parentId: 'parent-guest-1', status: 'pending' }],
        myVote: 'pending',
        isRequester: false,
      },
    });
    playdateApi.voteReschedule.mockResolvedValue({
      data: { rescheduleRequest: { id: 'resched-2', status: 'declined', newDate: '2026-10-22T08:00:00.000Z', newStartTime: '16:00', myVote: 'declined' }, playdate: null },
    });

    renderWithProviders(<PlaydateDetailPage />);

    const declineBtn = await screen.findByRole('button', { name: /từ chối lịch mới/i });
    expect(screen.getByRole('button', { name: /đồng ý lịch mới/i })).toBeInTheDocument();

    fireEvent.click(declineBtn);

    // The vote targets the request on screen, and a decline keeps the old schedule
    await waitFor(() => {
      expect(playdateApi.voteReschedule).toHaveBeenCalledWith('playdate-test-123', {
        requestId: 'resched-2',
        status: 'declined',
      });
      expect(screen.getByText(/giữ lịch cũ/i)).toBeInTheDocument();
    });
  });

  it('does NOT render vote buttons when caller has already accepted or is not in pending votes', async () => {
    playdateApi.getPlaydateById.mockResolvedValue({ data: mockParticipantPlaydate });
    playdateApi.getReschedule.mockResolvedValue({
      data: {
        _id: 'resched-1',
        status: 'pending',
        requestedBy: { fullName: 'Mẹ Lan' },
        reason: 'Dời lịch',
        newDate: '2026-10-22T08:00:00.000Z',
        newStartTime: '16:00',
        responses: [
          // Other parent is pending, not this user ('parent-other')
          { parentId: 'parent-other', status: 'pending' },
        ],
      },
    });

    renderWithProviders(<PlaydateDetailPage />, {
      preloadedState: {
        auth: { parent: { id: 'parent-guest-1' } },
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/đang có đề xuất đổi lịch hẹn mới/i)).toBeInTheDocument();
    });

    // The user should not see vote buttons
    expect(screen.queryByRole('button', { name: /đồng ý lịch mới/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /từ chối lịch mới/i })).not.toBeInTheDocument();
  });
});

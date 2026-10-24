import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, screen, fireEvent, waitFor } from '../utils/testUtils';
import { RescheduleModal } from '../../modules/playdate/components/RescheduleModal';
import { playdateApi } from '../../modules/playdate/api/playdateApi';

vi.mock('../../modules/playdate/api/playdateApi', () => ({
  playdateApi: {
    createReschedule: vi.fn(),
    getNearbyPlaces: vi.fn(),
    getPlaceById: vi.fn(),
    getBusyTimes: vi.fn(),
  },
}));

const PLAYDATE = {
  id: 'pd-1',
  scheduledDate: '2030-11-02T00:00:00.000Z',
  time: '09:00',
  durationMinutes: 120,
  isHost: true,
  myChildId: 'child-host',
  participants: [],
  location: { name: 'Công viên APEC', address: 'Bạch Đằng, Đà Nẵng' },
};

const renderModal = () =>
  renderWithProviders(<RescheduleModal isOpen onClose={vi.fn()} playdate={PLAYDATE} onSuccess={vi.fn()} />);

describe('RescheduleModal duration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playdateApi.createReschedule.mockResolvedValue({ data: { isAutoApplied: false, rescheduleRequest: {}, playdate: PLAYDATE } });
    playdateApi.getNearbyPlaces.mockResolvedValue({ data: [] });
    playdateApi.getBusyTimes.mockResolvedValue({ data: { busy: [] } });
  });

  it('shows a clash with the host child at the new time and does not send the proposal', async () => {
    const at = (time) => new Date(`2030-11-05T${time}:00`).toISOString();
    playdateApi.getBusyTimes.mockResolvedValue({
      data: { busy: [{ childId: 'child-host', childName: 'Bé Bắp', isOwnChild: true, start: '08:00', end: '10:00', startsAt: at('08:00'), endsAt: at('10:00') }] },
    });
    renderModal();

    fireEvent.change(screen.getByLabelText(/ngày mới đề xuất/i), { target: { value: '2030-11-05' } });
    expect(await screen.findByText(/trùng giờ bạn chọn, không thể dùng giờ này/)).toBeInTheDocument();
    expect(playdateApi.getBusyTimes).toHaveBeenLastCalledWith({ childId: 'child-host', date: '2030-11-05', excludePlaydateId: 'pd-1' });

    fireEvent.click(screen.getByRole('button', { name: /gửi đề xuất đổi lịch/i }));
    expect(await screen.findByText(/bé đã có một buổi hẹn khác trùng giờ này/i)).toBeInTheDocument();
    expect(playdateApi.createReschedule).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /chọn 10:00/i }));
    expect(screen.getByLabelText(/giờ hẹn mới/i).value).toBe('10:00');
  });

  it('starts from the current duration and shows the new end time', () => {
    renderModal();

    expect(screen.getByLabelText('Thời lượng').value).toBe('120');
    expect(screen.getByText('Kết thúc lúc 11:00')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Thời lượng'), { target: { value: '180' } });
    expect(screen.getByText('Kết thúc lúc 12:00')).toBeInTheDocument();
  });

  it('proposes a longer playdate at the same time', async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/ngày mới đề xuất/i), { target: { value: '2030-11-02' } });
    fireEvent.change(screen.getByLabelText('Thời lượng'), { target: { value: '180' } });
    fireEvent.click(screen.getByRole('button', { name: /gửi đề xuất đổi lịch/i }));

    await waitFor(() => {
      expect(playdateApi.createReschedule).toHaveBeenCalledWith('pd-1', {
        newDate: '2030-11-02',
        newStartTime: '09:00',
        reason: '',
        newDurationMinutes: 180,
      });
    });
  });

  it('does not send the duration when it did not change', async () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/ngày mới đề xuất/i), { target: { value: '2030-11-03' } });
    fireEvent.click(screen.getByRole('button', { name: /gửi đề xuất đổi lịch/i }));

    await waitFor(() => expect(playdateApi.createReschedule).toHaveBeenCalled());
    expect(playdateApi.createReschedule.mock.calls[0][1]).not.toHaveProperty('newDurationMinutes');
  });
});

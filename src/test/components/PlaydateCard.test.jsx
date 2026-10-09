import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../utils/testUtils';
import { PlaydateCard } from '../../modules/playdate/components/PlaydateCard';

const mockPlaydate = {
  id: 'playdate-123',
  activity: 'Buổi chơi Lego & Công viên',
  scheduledDate: '2026-10-15T08:00:00.000Z',
  time: '15:00',
  location: {
    name: 'Công viên Cầu Ánh Sao',
    address: 'Quận 7, TP. HCM',
  },
  note: 'Nhớ mang nón',
  status: 'upcoming',
  displayStatus: 'confirmed',
  isHost: true,
  hostParent: {
    id: 'parent-1',
    fullName: 'Mẹ Lan',
    avatarUrl: '',
  },
  hostChild: {
    id: 'child-1',
    displayName: 'Bé Bắp',
  },
  participants: [],
};

describe('PlaydateCard component', () => {
  it('renders playdate title, location, and confirmed status', () => {
    renderWithProviders(<PlaydateCard playdate={mockPlaydate} />);

    expect(screen.getByText('Buổi chơi Lego & Công viên')).toBeInTheDocument();
    expect(screen.getByText(/công viên cầu ánh sao/i)).toBeInTheDocument();
    expect(screen.getByText('Đã xác nhận')).toBeInTheDocument();
    expect(screen.getByText(/bạn là người tổ chức/i)).toBeInTheDocument();
  });

  it('renders "Hoàn thành" for the host only once the start time has passed', () => {
    const handleComplete = vi.fn();
    const started = { ...mockPlaydate, scheduledDate: new Date(Date.now() - 86400000).toISOString() };
    renderWithProviders(<PlaydateCard playdate={started} onComplete={handleComplete} />);

    const completeBtn = screen.getByRole('button', { name: /hoàn thành/i });
    expect(completeBtn).toBeInTheDocument();
  });

  it('hides "Hoàn thành" before the start time', () => {
    const later = { ...mockPlaydate, scheduledDate: new Date(Date.now() + 2 * 86400000).toISOString() };
    renderWithProviders(<PlaydateCard playdate={later} />);

    expect(screen.queryByRole('button', { name: /^hoàn thành$/i })).not.toBeInTheDocument();
    // The single start time is shown, never a range
    expect(screen.getByText(/15:00 •/)).toBeInTheDocument();
  });

  it('renders completed status and hides complete button when playdate is completed', () => {
    const completedPlaydate = {
      ...mockPlaydate,
      status: 'completed',
      displayStatus: 'completed',
      completedAt: '2026-10-15T17:30:00.000Z',
    };

    renderWithProviders(<PlaydateCard playdate={completedPlaydate} />);
    expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^hoàn thành$/i })).not.toBeInTheDocument();
  });
});

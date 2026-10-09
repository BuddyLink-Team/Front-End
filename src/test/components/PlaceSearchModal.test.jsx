import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { renderWithProviders, screen, fireEvent, waitFor } from '../utils/testUtils';
import { PlaceSearchModal } from '../../modules/playdate/components/PlaceSearchModal';
import { playdateApi } from '../../modules/playdate/api/playdateApi';

vi.mock('../../modules/playdate/api/playdateApi', () => ({
  playdateApi: {
    getNearbyPlaces: vi.fn(),
    getPlaceById: vi.fn(),
  },
}));

const place = {
  id: 'p1',
  placeId: 'osm-way-512870334',
  name: 'Công viên APEC',
  address: '',
  placeType: 'park',
  coordinates: [108.2238, 16.0598],
  distanceMeters: 1250,
  openingHours: '',
  phone: '',
  website: '',
  osmUrl: 'https://www.openstreetmap.org/way/512870334',
};

describe('PlaceSearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    playdateApi.getNearbyPlaces.mockResolvedValue({ data: [place] });
    playdateApi.getPlaceById.mockResolvedValue({
      data: { ...place, address: 'Bạch Đằng, Phường Hải Châu, Đà Nẵng', openingHours: '05:00-22:00' },
    });
  });

  it('waits for a new area to be synced, then reloads the list by itself', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    playdateApi.getNearbyPlaces
      .mockResolvedValueOnce({ data: [], meta: { areaSyncing: true } })
      .mockResolvedValue({ data: [place], meta: { areaSyncing: false } });
    try {
      renderWithProviders(<PlaceSearchModal isOpen onClose={vi.fn()} onSelectPlace={vi.fn()} />);

      expect(await screen.findByText(/đang tải địa điểm khu vực của bạn/i, {}, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.queryByText(/không tìm thấy địa điểm phù hợp/i)).not.toBeInTheDocument();

      // The reload is scheduled once the syncing state is rendered (waitFor would run on the fake clock)
      for (let i = 0; i < 20 && !screen.queryByText('Công viên APEC'); i += 1) {
        await act(() => vi.advanceTimersByTimeAsync(i === 0 ? 15000 : 100));
      }
      expect(screen.getByText('Công viên APEC')).toBeInTheDocument();
      expect(playdateApi.getNearbyPlaces).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('lists nearby places with the distance and no rating', async () => {
    renderWithProviders(<PlaceSearchModal isOpen onClose={vi.fn()} onSelectPlace={vi.fn()} />);

    expect(await screen.findByText('Công viên APEC')).toBeInTheDocument();
    expect(screen.getByText('1,3 km')).toBeInTheDocument();
    expect(screen.getByText(/© OpenStreetMap contributors/)).toBeInTheDocument();
  });

  it('opens the place details with the resolved address', async () => {
    renderWithProviders(<PlaceSearchModal isOpen onClose={vi.fn()} onSelectPlace={vi.fn()} />);

    fireEvent.click(await screen.findByRole('button', { name: /xem chi tiết công viên apec/i }));

    expect(await screen.findByText('Bạch Đằng, Phường Hải Châu, Đà Nẵng')).toBeInTheDocument();
    expect(screen.getByText(/giờ mở cửa: 05:00-22:00/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /xem trên openstreetmap/i })).toHaveAttribute('href', place.osmUrl);
    expect(playdateApi.getPlaceById).toHaveBeenCalledWith('p1');
  });

  it('fetches the address before choosing a place that has none', async () => {
    const onSelectPlace = vi.fn();
    const onClose = vi.fn();
    renderWithProviders(<PlaceSearchModal isOpen onClose={onClose} onSelectPlace={onSelectPlace} />);

    fireEvent.click(await screen.findByRole('button', { name: /^chọn$/i }));

    await waitFor(() =>
      expect(onSelectPlace).toHaveBeenCalledWith({
        name: 'Công viên APEC',
        address: 'Bạch Đằng, Phường Hải Châu, Đà Nẵng',
        placeId: 'osm-way-512870334',
        coordinates: { type: 'Point', coordinates: [108.2238, 16.0598] },
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('asks for a location when the parent has none', async () => {
    // apiClient rejects with the API error body
    playdateApi.getNearbyPlaces.mockRejectedValue({ message: 'x', error: { code: 'PARENT_LOCATION_REQUIRED' } });
    renderWithProviders(<PlaceSearchModal isOpen onClose={vi.fn()} onSelectPlace={vi.fn()} />);

    expect(await screen.findByText(/cập nhật vị trí trong hồ sơ/i)).toBeInTheDocument();
  });
});

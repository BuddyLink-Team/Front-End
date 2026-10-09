import React from 'react';
import {
  Search,
  MapPin,
  Compass,
  Trees,
  Coffee,
  Sparkles,
  Building2,
  BookOpen,
  Palette,
  Navigation,
  Clock,
  Phone,
  Globe,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/feedback/Modal';
import { FilterChips } from '../../../components/search/FilterChips';
import { EmptyState } from '../../../components/cards/EmptyState';
import { Spinner } from '../../../components/feedback/Spinner';
import { usePlaceSearch } from '../hooks/usePlaceSearch';

// Values follow PLACE_TYPES of the places module (Back-End)
const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: Compass },
  { id: 'park', label: 'Công viên', icon: Trees },
  { id: 'kids_cafe', label: 'Kids Cafe', icon: Coffee },
  { id: 'playground', label: 'Khu vui chơi', icon: Sparkles },
  { id: 'library', label: 'Thư viện', icon: BookOpen },
  { id: 'sports_center', label: 'Thể thao', icon: Building2 },
  { id: 'workshop', label: 'Workshop', icon: Palette },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '';
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
};

const directionsUrl = ([lng, lat]) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

const toLocation = (place) => ({
  name: place.name,
  address: place.address || '',
  placeId: place.placeId,
  coordinates: place.coordinates ? { type: 'Point', coordinates: place.coordinates } : null,
});

const PlaceMeta = ({ place }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted">
    {place.placeType && (
      <span className="font-medium px-2 py-0.5 rounded-full bg-surface-container-low">
        {CATEGORY_LABELS[place.placeType] || place.placeType}
      </span>
    )}
    {place.distanceMeters !== null && place.distanceMeters !== undefined && (
      <span className="inline-flex items-center gap-1">
        <Navigation className="w-3 h-3" /> {formatDistance(place.distanceMeters)}
      </span>
    )}
  </div>
);

const InfoRow = ({ icon: Icon, children }) => (
  <div className="flex items-start gap-2.5 text-sm text-text-primary">
    <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
    <div className="min-w-0 break-words">{children}</div>
  </div>
);

export const PlaceSearchModal = ({ isOpen, onClose, onSelectPlace, title = 'Địa điểm gợi ý lân cận' }) => {
  const {
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    places,
    isLoading,
    isAreaSyncing,
    errorMessage,
    selectedPlace,
    isDetailLoading,
    openPlace,
    closePlace,
    loadPlaceDetail,
  } = usePlaceSearch(isOpen);

  // A place chosen from the list may have no address yet: the details call resolves it
  const handleSelect = async (place) => {
    const full = place.address ? place : await loadPlaceDetail(place);
    onSelectPlace(toLocation(full));
    onClose();
  };

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-text-muted">
          <Spinner />
          <span className="text-xs">Đang tìm địa điểm gần bạn...</span>
        </div>
      );
    }
    if (places.length === 0 && isAreaSyncing) {
      return (
        <div className="h-48 flex flex-col items-center justify-center gap-2 text-center px-6" role="status">
          <Spinner />
          <p className="text-sm font-semibold text-text-primary">Đang tải địa điểm khu vực của bạn</p>
          <p className="text-xs text-text-muted max-w-xs">
            Đây là lần đầu khu vực này được tìm kiếm. Danh sách sẽ tự cập nhật sau ít phút, hoặc bạn có thể nhập địa điểm thủ công.
          </p>
        </div>
      );
    }
    if (places.length === 0) {
      return (
        <EmptyState
          icon={<MapPin className="w-6 h-6" />}
          title={errorMessage ? 'Không thể tải danh sách địa điểm' : 'Không tìm thấy địa điểm phù hợp'}
          description={errorMessage || 'Thử từ khóa khác, đổi danh mục hoặc nhập địa điểm thủ công.'}
        />
      );
    }
    return places.map((place) => (
      <div
        key={place.id || place.placeId}
        className="p-3.5 rounded-2xl border border-hairline hover:border-primary-border hover:bg-primary-soft transition-colors flex items-center gap-3 bg-surface-container-lowest"
      >
        <button type="button" onClick={() => openPlace(place)} className="flex-1 min-w-0 text-left space-y-1">
          <p className="text-sm font-semibold text-text-primary truncate">{place.name}</p>
          <p className="text-xs text-text-muted line-clamp-1">{place.address || 'Xem chi tiết để lấy địa chỉ'}</p>
          <PlaceMeta place={place} />
        </button>
        <Button type="button" variant="secondary" size="sm" onClick={() => handleSelect(place)} disabled={isDetailLoading}>
          Chọn
        </Button>
        <button
          type="button"
          onClick={() => openPlace(place)}
          aria-label={`Xem chi tiết ${place.name}`}
          className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-surface-muted"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    ));
  };

  const renderDetail = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h4 className="text-title-md text-text-primary">{selectedPlace.name}</h4>
        <PlaceMeta place={selectedPlace} />
      </div>

      <div className="space-y-3 p-4 rounded-2xl bg-surface-container-low border border-hairline">
        <InfoRow icon={MapPin}>
          {isDetailLoading && !selectedPlace.address ? (
            <span className="text-text-muted">Đang lấy địa chỉ...</span>
          ) : (
            selectedPlace.address || <span className="text-text-muted">Chưa có địa chỉ chi tiết, bạn có thể nhập thêm sau khi chọn.</span>
          )}
        </InfoRow>
        {selectedPlace.openingHours && <InfoRow icon={Clock}>Giờ mở cửa: {selectedPlace.openingHours}</InfoRow>}
        {selectedPlace.phone && (
          <InfoRow icon={Phone}>
            <a href={`tel:${selectedPlace.phone}`} className="text-primary-dark hover:underline">
              {selectedPlace.phone}
            </a>
          </InfoRow>
        )}
        {selectedPlace.website && (
          <InfoRow icon={Globe}>
            <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer" className="text-primary-dark hover:underline">
              {selectedPlace.website}
            </a>
          </InfoRow>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-semibold">
        {selectedPlace.coordinates && (
          <a
            href={directionsUrl(selectedPlace.coordinates)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-dark hover:underline"
          >
            <Navigation className="w-3.5 h-3.5" /> Chỉ đường
          </a>
        )}
        {selectedPlace.osmUrl && (
          <a
            href={selectedPlace.osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-dark hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Xem trên OpenStreetMap
          </a>
        )}
      </div>
    </div>
  );

  const footer = selectedPlace ? (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={closePlace}>
        Quay lại
      </Button>
      <Button type="button" variant="primary" size="sm" onClick={() => handleSelect(selectedPlace)} isLoading={isDetailLoading}>
        Chọn địa điểm này
      </Button>
    </>
  ) : (
    <Button type="button" variant="ghost" size="sm" onClick={onClose}>
      Đóng
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedPlace ? 'Thông tin địa điểm' : title}
      maxWidth="max-w-xl"
      placement="sheet"
      footer={footer}
    >
      {selectedPlace ? (
        renderDetail()
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-text-muted">Công viên, kids cafe và không gian vui chơi an toàn gần nhà bạn</p>

          <Input
            placeholder="Tìm theo tên địa điểm hoặc phường..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-text-muted" />}
            autoFocus
          />

          <FilterChips
            options={CATEGORIES}
            selected={activeCategory}
            onChange={(value) => setActiveCategory(value || 'all')}
          />

          <div className="space-y-2.5 min-h-[220px]">{renderList()}</div>

          {/* ODbL attribution required for OpenStreetMap data */}
          <p className="text-[10px] text-text-muted text-right">Dữ liệu địa điểm © OpenStreetMap contributors</p>
        </div>
      )}
    </Modal>
  );
};

export default PlaceSearchModal;

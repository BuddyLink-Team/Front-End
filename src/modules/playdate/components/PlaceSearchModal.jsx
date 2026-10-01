import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Star,
  X,
  Compass,
  Trees,
  Coffee,
  Sparkles,
  CheckCircle2,
  Building2,
  Loader2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { playdateApi } from '../api/playdateApi';

const CATEGORIES = [
  { label: 'Tất cả', value: 'all', icon: Compass },
  { label: 'Công viên', value: 'park', icon: Trees },
  { label: 'Kids Cafe', value: 'kids_cafe', icon: Coffee },
  { label: 'Khu vui chơi', value: 'playground', icon: Sparkles },
  { label: 'Thể thao', value: 'sports_center', icon: Building2 },
];

export const PlaceSearchModal = ({ isOpen, onClose, onSelectPlace }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isCurrent = true;
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (activeCategory !== 'all') params.type = activeCategory;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const res = await playdateApi.getNearbyPlaces(params);
        if (isCurrent && res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.places || [];
          setPlaces(list);
        }
      } catch (err) {
        // Fallback gracefully
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchPlaces, 250);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [isOpen, activeCategory, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-hairline flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary-dark">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Tìm kiếm địa điểm vui chơi
              </h3>
              <p className="text-xs text-text-muted">
                Công viên, quán cafe trẻ em và không gian giải trí an toàn cho bé
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <Input
          placeholder="Nhập tên địa điểm, công viên hoặc quận/huyện..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-text-muted" />}
          autoFocus
        />

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shrink-0 font-medium ${
                  isActive
                    ? 'bg-secondary text-white border-secondary shadow-xs'
                    : 'bg-surface-subtle text-text-muted border-hairline hover:border-gray-300 hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Places List */}
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 min-h-[220px]">
          {isLoading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Đang tìm kiếm địa điểm lân cận...</span>
            </div>
          ) : places.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-text-muted text-center p-4">
              <MapPin className="w-8 h-8 text-gray-300" />
              <p className="text-sm font-medium">Không tìm thấy địa điểm phù hợp</p>
              <p className="text-xs">Thử tìm kiếm với từ khóa khác hoặc đổi danh mục</p>
            </div>
          ) : (
            places.map((place) => (
              <div
                key={place.id || place.placeId}
                onClick={() => {
                  onSelectPlace({
                    name: place.name,
                    address: place.address,
                    placeId: place.placeId,
                    coordinates: {
                      type: 'Point',
                      coordinates: place.coordinates || [0, 0],
                    },
                  });
                  onClose();
                }}
                className="p-3.5 rounded-2xl border border-hairline hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer flex items-start justify-between gap-3 group bg-white shadow-2xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-primary-dark truncate">
                      {place.name}
                    </p>
                    {place.rating > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {place.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1">
                    {place.address}
                  </p>
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-text-muted capitalize">
                    {place.placeType?.replace('_', ' ')}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs font-semibold text-primary p-2 group-hover:bg-primary group-hover:text-white rounded-xl transition-all"
                >
                  Chọn
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end border-t border-hairline shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceSearchModal;

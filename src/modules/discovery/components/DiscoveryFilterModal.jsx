import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../redux/discoverySlice';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';

const PERSONALITY_CHIPS = [
  'Hòa đồng',
  'Năng động',
  'Sáng tạo',
  'Thích khám phá',
  'Nhút nhát',
  'Thông minh',
  'Vui tính',
  'Kiên nhẫn',
];

/**
 * DiscoveryFilterModal
 * Renders a backdrop-blur modal with dual-range age slider, distance slider,
 * and personality chip multi-select. Persists state to Redux discoverySlice.
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback to close the modal
 */
const DiscoveryFilterModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const savedFilters = useSelector((s) => s.discovery?.filters);

  const [maxDistance, setMaxDistance] = useState(savedFilters?.maxDistance ?? 20);
  const [minAge, setMinAge] = useState(savedFilters?.minAge ?? 1);
  const [maxAge, setMaxAge] = useState(savedFilters?.maxAge ?? 12);
  const [selectedPersonalities, setSelectedPersonalities] = useState(
    savedFilters?.personalities ?? []
  );

  // Sync local state when modal opens with persisted redux state
  useEffect(() => {
    if (isOpen && savedFilters) {
      setMaxDistance(savedFilters.maxDistance ?? 20);
      setMinAge(savedFilters.minAge ?? 1);
      setMaxAge(savedFilters.maxAge ?? 12);
      setSelectedPersonalities(savedFilters.personalities ?? []);
    }
  }, [isOpen, savedFilters]);

  const handlePersonalityToggle = (chip) => {
    setSelectedPersonalities((prev) =>
      prev.includes(chip) ? prev.filter((p) => p !== chip) : [...prev, chip]
    );
  };

  const handleReset = () => {
    setMaxDistance(20);
    setMinAge(1);
    setMaxAge(12);
    setSelectedPersonalities([]);
    dispatch(resetFilters());
  };

  const handleApply = () => {
    dispatch(
      setFilters({
        maxDistance,
        minAge,
        maxAge,
        personalities: selectedPersonalities,
      })
    );
    onClose();
  };

  const AGE_MIN = 1;
  const AGE_MAX = 12;

  const handleMinAgeChange = (e) => {
    setMinAge(Math.min(parseInt(e.target.value, 10), maxAge));
  };

  const handleMaxAgeChange = (e) => {
    setMaxAge(Math.max(parseInt(e.target.value, 10), minAge));
  };

  const leftPct = ((minAge - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const rightPct = ((maxAge - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bộ lọc tìm kiếm">
      <div className="w-full">

        <div className="flex flex-col gap-6">
          {/* Distance slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-on-surface">Khoảng cách</label>
              <span className="text-sm font-semibold text-white px-3 py-0.5 bg-primary rounded-full">
                Trong vòng {maxDistance} km
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value, 10))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-surface-container"
            />
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-container" />

          {/* Age range dual slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-on-surface">Độ tuổi của bé</label>
              <span className="text-sm font-semibold text-white px-3 py-0.5 bg-primary rounded-full">
                {minAge} – {maxAge} tuổi
              </span>
            </div>
            <div className="dual-range">
              <div className="dual-range-track">
                <div
                  className="dual-range-fill"
                  style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
                />
              </div>
              <input
                type="range"
                min={AGE_MIN}
                max={AGE_MAX}
                step={1}
                value={minAge}
                onChange={handleMinAgeChange}
                aria-label="Tuổi tối thiểu"
                style={{ zIndex: minAge >= AGE_MAX - 1 ? 5 : 3 }}
              />
              <input
                type="range"
                min={AGE_MIN}
                max={AGE_MAX}
                step={1}
                value={maxAge}
                onChange={handleMaxAgeChange}
                aria-label="Tuổi tối đa"
                style={{ zIndex: 4 }}
              />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{AGE_MIN} tuổi</span>
              <span>{AGE_MAX} tuổi</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-container" />

          {/* Personality chips */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-on-surface">Tính cách bé</label>
            <div className="flex flex-wrap gap-2">
              {PERSONALITY_CHIPS.map((chip) => {
                const isActive = selectedPersonalities.includes(chip);
                return (
                  <button
                    key={chip}
                    onClick={() => handlePersonalityToggle(chip)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                      ${isActive
                        ? 'bg-primary-container border-primary text-on-primary-container'
                        : 'bg-white border-hairline text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={handleReset}
            leftIcon={<RotateCcw size={15} strokeWidth={1.75} />}
            className="flex-1"
          >
            Đặt lại
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            className="flex-1"
          >
            Áp dụng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DiscoveryFilterModal;

import React from 'react';
import { RotateCcw } from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { FilterChips } from '../../../components/search/FilterChips';
import { useDiscoveryFilterForm } from '../hooks/useDiscoveryFilterForm';
import { AGE_RANGE_YEARS, DISTANCE_RANGE_KM, PERSONALITY_FILTER_OPTIONS } from '../constants/discoveryConstants';

/**
 * DiscoveryFilterModal
 * Distance slider, dual-thumb age slider and personality chips. Draft state lives in
 * useDiscoveryFilterForm and is committed to the discovery slice on apply.
 *
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback to close the modal
 */
const DiscoveryFilterModal = ({ isOpen, onClose }) => {
  const { form, ageTrack, isMinAgeOnTop, setMaxDistance, setMinAge, setMaxAge, setPersonalities, reset, apply } =
    useDiscoveryFilterForm(isOpen, onClose);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bộ lọc tìm kiếm"
      footer={
        <>
          <Button variant="ghost" onClick={reset} leftIcon={<RotateCcw size={15} strokeWidth={1.75} />} className="flex-1">
            Đặt lại
          </Button>
          <Button variant="primary" onClick={apply} className="flex-1">
            Áp dụng
          </Button>
        </>
      }
    >
      <div className="w-full">
        <div className="flex flex-col gap-6">
          {/* Distance slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-on-surface">Khoảng cách</label>
              <span className="text-sm font-semibold text-white px-3 py-0.5 bg-primary rounded-full">
                Trong vòng {form.maxDistance} km
              </span>
            </div>
            <input
              type="range"
              min={DISTANCE_RANGE_KM.MIN}
              max={DISTANCE_RANGE_KM.MAX}
              step={1}
              value={form.maxDistance}
              onChange={(e) => setMaxDistance(e.target.value)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-primary bg-surface-container"
            />
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{DISTANCE_RANGE_KM.MIN} km</span>
              <span>{DISTANCE_RANGE_KM.MAX} km</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-container" />

          {/* Age range dual slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-on-surface">Độ tuổi của bé</label>
              <span className="text-sm font-semibold text-white px-3 py-0.5 bg-primary rounded-full">
                {form.minAge} – {form.maxAge} tuổi
              </span>
            </div>
            <div className="dual-range">
              <div className="dual-range-track">
                <div className="dual-range-fill" style={{ left: `${ageTrack.left}%`, right: `${ageTrack.right}%` }} />
              </div>
              <input
                type="range"
                min={AGE_RANGE_YEARS.MIN}
                max={AGE_RANGE_YEARS.MAX}
                step={1}
                value={form.minAge}
                onChange={(e) => setMinAge(e.target.value)}
                aria-label="Tuổi tối thiểu"
                className={isMinAgeOnTop ? 'z-[5]' : 'z-[3]'}
              />
              <input
                type="range"
                min={AGE_RANGE_YEARS.MIN}
                max={AGE_RANGE_YEARS.MAX}
                step={1}
                value={form.maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                aria-label="Tuổi tối đa"
                className="z-[4]"
              />
            </div>
            <div className="flex justify-between text-xs text-on-surface-variant">
              <span>{AGE_RANGE_YEARS.MIN} tuổi</span>
              <span>{AGE_RANGE_YEARS.MAX} tuổi</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-container" />

          {/* Personality chips */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-on-surface">Tính cách bé</label>
            <FilterChips
              options={PERSONALITY_FILTER_OPTIONS}
              selected={form.personalities}
              onChange={setPersonalities}
              multiple
              className="flex-wrap overflow-visible"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DiscoveryFilterModal;

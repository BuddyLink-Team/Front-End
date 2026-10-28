import React, { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { Controller } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Combobox } from '../../../components/ui/Combobox';
import { Button } from '../../../components/ui/Button';
import { PlaceSearchModal } from '../../playdate/components/PlaceSearchModal';
import { getLocalDateString } from '../../../utils/formatters';
import { interestOptions, customFormDefaults, ACTIVITY_OPTIONS } from '../utils/aiAssistantUtils';
import { useInvitableChildren } from '../hooks/useInvitableChildren';
import { useChoiceCustomForm } from '../hooks/useChoiceCustomForm';
import { SearchChecklist } from './SearchChecklist';
import { AI_STEPS } from '../constants/aiAssistantConstants';
import { MATCH_CRITERIA_LIMITS } from '../validation/aiAssistantValidation';

const toggleValue = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

/** Friends' children of the connected families, searched by the child's or the parent's name */
const PlaymateSearch = ({ hostChildId, playmates, onChange }) => {
  const { items, isLoading, hasError } = useInvitableChildren(hostChildId);
  const toggle = (childId) => {
    const isPicked = playmates.some((playmate) => playmate.childId === childId);
    const item = items.find((entry) => entry.value === childId);
    onChange(isPicked ? playmates.filter((playmate) => playmate.childId !== childId) : [...playmates, { childId, name: item.label }]);
  };
  return (
    <SearchChecklist
      label="Tìm bạn muốn mời"
      placeholder="Gõ tên bé hoặc tên phụ huynh"
      items={items}
      selected={playmates.map((playmate) => playmate.childId)}
      onToggle={toggle}
      isLoading={isLoading}
      emptyText={hasError ? 'Không tải được danh sách bạn bè, bạn thử lại sau nhé.' : 'Bạn chưa kết nối với gia đình nào.'}
      helperText="Chỉ mời được bé nhà bạn bè đã kết nối"
    />
  );
};

PlaymateSearch.propTypes = {
  hostChildId: PropTypes.string.isRequired,
  playmates: PropTypes.arrayOf(PropTypes.shape({ childId: PropTypes.string, name: PropTypes.string })).isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * "Other answer" of a choice card, picked from a searchable list wherever one exists so nothing is mistyped:
 * friends' children, a catalog activity (or its own), another time, a place from the search, edited criteria
 * or a free extra request
 * @param {Object} card
 * @param {(custom: Object, label: string) => void} onSubmit
 * @param {Function} onCancel
 */
export const ChoiceCustomForm = ({ card, onSubmit, onCancel }) => {
  const fieldId = useId();
  const { register, control, submit, submitPlace, errorOf } = useChoiceCustomForm(card, onSubmit);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(card.stepId === AI_STEPS.PLACE);
  // Interests of the criteria first, so those not in the catalog can still be removed
  const [interestItems] = useState(() => interestOptions(customFormDefaults(card).interests));
  const hasPlaymateSearch = card.stepId === AI_STEPS.PLAYMATES && Boolean(card.hostChildId);
  const formError = errorOf('form') || errorOf('name');

  if (card.stepId === AI_STEPS.PLACE) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" leftIcon={<MapPin className="w-3.5 h-3.5" />} onClick={() => setIsPlaceModalOpen(true)}>
          Tìm địa điểm khác
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        {formError && <p className="w-full text-xs text-error">{formError}</p>}
        <PlaceSearchModal
          isOpen={isPlaceModalOpen}
          onClose={() => setIsPlaceModalOpen(false)}
          onSelectPlace={submitPlace}
          title="Chọn địa điểm khác"
        />
      </div>
    );
  }

  return (
    <form className="space-y-3 rounded-xl border border-hairline-strong shadow-sm bg-surface-container-low p-3" onSubmit={submit} noValidate>
      {card.stepId === AI_STEPS.TIME && (
        <div className="grid grid-cols-2 gap-2">
          <Input id={`${fieldId}-date`} type="date" label="Ngày" min={getLocalDateString()} error={errorOf('date')} {...register('date')} />
          <Input id={`${fieldId}-time`} type="time" label="Giờ" error={errorOf('time')} {...register('time')} />
        </div>
      )}
      {hasPlaymateSearch && (
        <Controller
          name="playmates"
          control={control}
          render={({ field }) => <PlaymateSearch hostChildId={card.hostChildId} playmates={field.value || []} onChange={field.onChange} />}
        />
      )}
      {hasPlaymateSearch && errorOf('playmates') && <p className="text-xs text-error">{errorOf('playmates')}</p>}
      {(card.stepId === AI_STEPS.CHILD || (card.stepId === AI_STEPS.PLAYMATES && !hasPlaymateSearch)) && (
        <Input
          id={`${fieldId}-text`}
          label={card.stepId === AI_STEPS.CHILD ? 'Tên bé' : 'Tên các bạn muốn mời'}
          placeholder={card.stepId === AI_STEPS.CHILD ? 'Ví dụ: Bống' : 'Ví dụ: Bin, Mít'}
          helperText={card.stepId === AI_STEPS.PLAYMATES ? 'Chỉ mời được bé nhà bạn bè đã kết nối' : undefined}
          error={errorOf('text')}
          {...register('text')}
        />
      )}
      {card.stepId === AI_STEPS.EXTRA && (
        <Textarea
          id={`${fieldId}-request`}
          label="Yêu cầu thêm"
          rows={3}
          placeholder="Ví dụ: Nhắc các bé mang theo nón và nước uống"
          error={errorOf('request')}
          {...register('request')}
        />
      )}
      {card.stepId === AI_STEPS.ACTIVITY && (
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <Combobox
              id={`${fieldId}-title`}
              label="Hoạt động"
              placeholder="Tìm trong danh sách hoặc tự nhập"
              options={ACTIVITY_OPTIONS}
              value={field.value || ''}
              onChange={field.onChange}
              error={errorOf('title')}
              emptyText="Không có hoạt động gợi ý phù hợp, bạn có thể giữ nội dung đã nhập."
            />
          )}
        />
      )}
      {card.stepId === AI_STEPS.MATCH_CRITERIA && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Input
              id={`${fieldId}-age-min`}
              type="number"
              label="Từ tuổi"
              min={MATCH_CRITERIA_LIMITS.AGE_MIN}
              max={MATCH_CRITERIA_LIMITS.AGE_MAX}
              error={errorOf('ageMin')}
              {...register('ageMin')}
            />
            <Input
              id={`${fieldId}-age-max`}
              type="number"
              label="Đến tuổi"
              min={MATCH_CRITERIA_LIMITS.AGE_MIN}
              max={MATCH_CRITERIA_LIMITS.AGE_MAX}
              error={errorOf('ageMax')}
              {...register('ageMax')}
            />
            <Input
              id={`${fieldId}-distance`}
              type="number"
              label="Trong (km)"
              min={MATCH_CRITERIA_LIMITS.DISTANCE_MIN_KM}
              max={MATCH_CRITERIA_LIMITS.DISTANCE_MAX_KM}
              error={errorOf('maxDistanceKm')}
              {...register('maxDistanceKm')}
            />
          </div>
          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <SearchChecklist
                label="Sở thích (không bắt buộc)"
                placeholder="Tìm sở thích, ví dụ: vẽ, bơi"
                items={interestItems}
                selected={field.value || []}
                onToggle={(value) => field.onChange(toggleValue(field.value || [], value))}
              />
            )}
          />
        </>
      )}
      {formError && <p className="text-xs text-error">{formError}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" size="sm">
          Gửi
        </Button>
      </div>
    </form>
  );
};

ChoiceCustomForm.propTypes = {
  card: PropTypes.shape({
    stepId: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    durationMinutes: PropTypes.number,
    hostChildId: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ChoiceCustomForm;

import React from 'react';
import PropTypes from 'prop-types';
import { Baby, Calendar, Check, HeartHandshake, MapPin, PencilLine, Send, Shapes, SlidersHorizontal, StickyNote, Users } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { Button } from '../../../components/ui/Button';
import { CHIP_CLASS, chipState } from '../../playdate/utils/suggestionFormatters';
import { useChoiceCard } from '../hooks/useChoiceCard';
import { OptionLinks } from './OptionLinks';
import { ChoiceCustomForm } from './ChoiceCustomForm';
import { ToolCardFrame } from './ToolCardFrame';
import { AI_STEPS, AI_STEP_TONES, AI_TONES } from '../constants/ai-assistant.constants';

// Same icons as the Playdate and Discovery pages
const STEP_ICONS = {
  [AI_STEPS.MATCH_CRITERIA]: SlidersHorizontal,
  [AI_STEPS.CONNECT]: HeartHandshake,
  [AI_STEPS.CHILD]: Baby,
  [AI_STEPS.TIME]: Calendar,
  [AI_STEPS.PLAYMATES]: Users,
  [AI_STEPS.ACTIVITY]: Shapes,
  [AI_STEPS.PLACE]: MapPin,
  [AI_STEPS.EXTRA]: StickyNote,
};

const CUSTOM_LABELS = {
  [AI_STEPS.CHILD]: 'Nhập tên bé',
  [AI_STEPS.TIME]: 'Chọn giờ khác',
  [AI_STEPS.PLAYMATES]: 'Tìm bạn khác',
  [AI_STEPS.ACTIVITY]: 'Hoạt động khác',
  [AI_STEPS.PLACE]: 'Địa điểm khác',
  [AI_STEPS.MATCH_CRITERIA]: 'Sửa tiêu chí',
  [AI_STEPS.EXTRA]: 'Có, mình muốn thêm…',
};

// Button that sends a multiple selection
const MULTIPLE_SUBMIT = {
  [AI_STEPS.CONNECT]: { label: 'Gửi lời mời', icon: Send },
};

/**
 * One step the parent answers by tapping (time, playmates, activity, place, search criteria).
 * Once answered it stays visible, read only, with the picked option highlighted.
 *
 * @param {Object} card - choices card from the assistant
 * @param {(answer: Object) => void} onChoose - { optionIds } or { custom, label }
 * @param {boolean} [disabled] - A message is being sent
 * @param {(childId: string) => void} [onViewChild] - Opens a child's public profile
 */
export const ChoiceCard = ({ card, onChoose, disabled = false, onViewChild }) => {
  const choice = useChoiceCard(card, onChoose);
  const isLocked = disabled || choice.isAnswered;
  const customAnswerText =
    card.customAnswer &&
    (card.customAnswer.title || card.customAnswer.name || card.customAnswer.text || card.customAnswer.request || 'Câu trả lời khác');
  const submit = MULTIPLE_SUBMIT[card.stepId];
  const SubmitIcon = submit?.icon;

  const tone = AI_STEP_TONES[card.stepId] || AI_TONES.primary;

  return (
    <ToolCardFrame
      tone={tone}
      icon={STEP_ICONS[card.stepId] || Check}
      title={card.title}
      aside={
        <>
          {choice.isMultiple && !choice.isAnswered && (
            <span className="shrink-0 text-label-sm text-text-muted">Chọn một hoặc nhiều</span>
          )}
          {choice.isAnswered && (
            <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-label-sm font-medium', tone.chip)}>
              <Check className="w-3 h-3" /> Đã chọn
            </span>
          )}
        </>
      }
    >

      {card.options.length === 0 ? (
        <p className="text-xs text-text-muted">Chưa có gợi ý phù hợp cho bước này.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {card.options.map((option) => {
            const isSelected = choice.isSelected(option.id);
            return (
              <div
                key={option.id}
                className={cn(
                  'rounded-xl border transition-colors',
                  chipState(isSelected),
                  'shadow-sm',
                  !isSelected && 'border-hairline-strong',
                  choice.isAnswered && !isSelected && 'border-hairline-strong bg-surface-container-low',
                )}
              >
                <button
                  type="button"
                  disabled={isLocked}
                  aria-pressed={isSelected}
                  onClick={() => choice.pickOption(option.id)}
                  className={cn(CHIP_CLASS, 'w-full border-0 bg-transparent disabled:cursor-default')}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-text-primary break-words">{option.label}</span>
                    {option.badge && (
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-label-sm', tone.chip)}>
                        {option.badge}
                      </span>
                    )}
                  </span>
                  {option.description && <span className="text-label-sm text-text-muted break-words">{option.description}</span>}
                </button>
                {option.links?.length > 0 && (
                  <div className="px-3 pb-2">
                    <OptionLinks links={option.links} onViewChild={onViewChild} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {choice.isAnswered && (choice.isSkipped || customAnswerText) && (
        <p className="text-xs text-text-muted">{choice.isSkipped ? 'Đã bỏ qua bước này.' : `Đã chọn: ${customAnswerText}`}</p>
      )}

      {!choice.isAnswered && (
        <>
          {choice.isCustomOpen ? (
            <ChoiceCustomForm card={card} onSubmit={choice.submitCustom} onCancel={choice.closeCustom} />
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {choice.isMultiple && (
                <Button
                  size="sm"
                  disabled={disabled || choice.selectedCount === 0}
                  leftIcon={SubmitIcon && <SubmitIcon className="w-3.5 h-3.5" />}
                  onClick={choice.confirmMultiple}
                >
                  {submit?.label || 'Xong'}
                  {choice.selectedCount ? ` (${choice.selectedCount})` : ''}
                </Button>
              )}
              {card.allowCustom && (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={disabled}
                  leftIcon={<PencilLine className="w-3.5 h-3.5" />}
                  onClick={choice.openCustom}
                >
                  {CUSTOM_LABELS[card.stepId] || 'Khác…'}
                </Button>
              )}
              {card.allowSkip && (
                <Button size="sm" variant="ghost" disabled={disabled} onClick={choice.skip}>
                  Bỏ qua
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </ToolCardFrame>
  );
};

ChoiceCard.propTypes = {
  card: PropTypes.shape({
    stepId: PropTypes.string.isRequired,
    title: PropTypes.string,
    status: PropTypes.string.isRequired,
    selectionMode: PropTypes.oneOf(['single', 'multiple']),
    selectedOptionIds: PropTypes.arrayOf(PropTypes.string),
    allowCustom: PropTypes.bool,
    allowSkip: PropTypes.bool,
    hostChildId: PropTypes.string,
    customAnswer: PropTypes.object,
    preselectedOptionIds: PropTypes.arrayOf(PropTypes.string),
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        description: PropTypes.string,
        badge: PropTypes.string,
        links: PropTypes.array,
      }),
    ).isRequired,
  }).isRequired,
  onChoose: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  onViewChild: PropTypes.func,
};

export default ChoiceCard;

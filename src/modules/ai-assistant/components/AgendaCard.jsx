import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Check, Plus, Shapes, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { cn } from '../../../utils/cn';
import { normalizeAgenda } from '../utils/aiAssistantUtils';
import { ToolCardFrame } from './ToolCardFrame';
import { AI_CHOICE_STATUS, AI_LIMITS, AI_STEP_TONES, AI_STEPS, AI_TONE_CYCLE } from '../constants/aiAssistantConstants';

const NumberBadge = ({ index }) => (
  <span
    className={cn(
      'flex w-6 h-6 shrink-0 items-center justify-center rounded-full text-label-sm font-semibold',
      AI_TONE_CYCLE[index % AI_TONE_CYCLE.length].tile,
    )}
  >
    {index + 1}
  </span>
);

NumberBadge.propTypes = { index: PropTypes.number.isRequired };

/**
 * Main activities written by the assistant, edited by the parent before the summary (agenda step).
 * Once sent it stays visible, read only, with the list the parent kept.
 *
 * @param {Object} card - choices card of the agenda step (options = the suggested activities)
 * @param {(answer: { custom: { agenda: string[] }, label: string }) => void} onChoose
 * @param {boolean} [disabled] - A message is being sent, or the plan is closed
 */
export const AgendaCard = ({ card, onChoose, disabled = false }) => {
  const [items, setItems] = useState(() => card.options.map((option) => option.label));
  const isAnswered = card.status === AI_CHOICE_STATUS.ANSWERED;
  const agenda = normalizeAgenda(items);
  const tone = AI_STEP_TONES[AI_STEPS.AGENDA];

  if (isAnswered) {
    const kept = card.customAnswer?.agenda || items;
    return (
      <ToolCardFrame
        tone={tone}
        icon={Shapes}
        title={card.title}
        aside={
          <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-label-sm font-medium', tone.chip)}>
            <Check className="w-3 h-3" /> Đã chọn
          </span>
        }
      >
        <ol className="space-y-1.5">
          {kept.map((item, index) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text-primary">
              <NumberBadge index={index} />
              <span className="pt-0.5 break-words">{item}</span>
            </li>
          ))}
        </ol>
      </ToolCardFrame>
    );
  }

  return (
    <ToolCardFrame tone={tone} icon={Shapes} title={card.title}>
      <p className="text-xs text-text-muted">Bạn sửa, xóa hoặc thêm trò chơi cho các bé nhé.</p>
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <NumberBadge index={index} />
            <Input
              aria-label={`Hoạt động chính ${index + 1}`}
              value={item}
              maxLength={AI_LIMITS.AGENDA_ITEM_MAX_LENGTH}
              disabled={disabled}
              onChange={(event) => setItems((prev) => prev.map((value, i) => (i === index ? event.target.value : value)))}
            />
            <button
              type="button"
              aria-label={`Xóa hoạt động ${index + 1}`}
              disabled={disabled}
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              className="shrink-0 rounded-lg p-2 text-text-muted hover:bg-surface-muted hover:text-error disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={disabled || agenda.length === 0}
          leftIcon={<Check className="w-3.5 h-3.5" />}
          onClick={() => onChoose({ custom: { agenda }, label: 'Dùng các hoạt động chính này' })}
        >
          Dùng các hoạt động này
        </Button>
        {items.length < AI_LIMITS.MAX_AGENDA_ITEMS && (
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setItems((prev) => [...prev, ''])}
          >
            Thêm hoạt động
          </Button>
        )}
      </div>
    </ToolCardFrame>
  );
};

AgendaCard.propTypes = {
  card: PropTypes.shape({
    title: PropTypes.string,
    status: PropTypes.string.isRequired,
    customAnswer: PropTypes.shape({ agenda: PropTypes.arrayOf(PropTypes.string) }),
    options: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string.isRequired })).isRequired,
  }).isRequired,
  onChoose: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AgendaCard;

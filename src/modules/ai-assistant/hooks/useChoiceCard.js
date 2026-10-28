import { useCallback, useMemo, useState } from 'react';
import { AI_CHOICE_STATUS, AI_OPTION_IDS } from '../constants/ai-assistant.constants';

/**
 * UI state of one choice card: picked options (multiple selection) and the "other answer" form
 * @param {Object} card
 * @param {(answer: { optionIds?: string[], custom?: Object, label?: string }) => void} onChoose
 */
export const useChoiceCard = (card, onChoose) => {
  // Ticked by the assistant (e.g. the children named for a connection request), the parent can untick them
  const [selectedIds, setSelectedIds] = useState(() => card.preselectedOptionIds || []);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const isAnswered = card.status === AI_CHOICE_STATUS.ANSWERED;
  const isMultiple = card.selectionMode === 'multiple';
  const answeredIds = useMemo(() => card.selectedOptionIds || [], [card.selectedOptionIds]);
  const isSkipped = answeredIds.includes(AI_OPTION_IDS.SKIP);

  const isSelected = useCallback(
    (optionId) => (isAnswered ? answeredIds.includes(optionId) : selectedIds.includes(optionId)),
    [isAnswered, answeredIds, selectedIds],
  );

  const pickOption = useCallback(
    (optionId) => {
      if (isAnswered) return;
      if (!isMultiple) {
        onChoose({ optionIds: [optionId] });
        return;
      }
      setSelectedIds((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
    },
    [isAnswered, isMultiple, onChoose],
  );

  const confirmMultiple = useCallback(() => {
    if (selectedIds.length) onChoose({ optionIds: selectedIds });
  }, [onChoose, selectedIds]);

  const skip = useCallback(() => onChoose({ optionIds: [AI_OPTION_IDS.SKIP], label: 'Bỏ qua bước này' }), [onChoose]);

  const submitCustom = useCallback(
    (custom, label) => {
      setIsCustomOpen(false);
      onChoose({ custom, label });
    },
    [onChoose],
  );

  return {
    isAnswered,
    isMultiple,
    isSkipped,
    selectedCount: selectedIds.length,
    isSelected,
    pickOption,
    confirmMultiple,
    skip,
    isCustomOpen,
    openCustom: () => setIsCustomOpen(true),
    closeCustom: () => setIsCustomOpen(false),
    submitCustom,
  };
};

export default useChoiceCard;

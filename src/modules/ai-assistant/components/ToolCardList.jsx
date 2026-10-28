import React from 'react';
import PropTypes from 'prop-types';
import { AI_CARD_TYPES, AI_OPTION_IDS, AI_PLAN_STEPS, AI_STEPS } from '../constants/ai-assistant.constants';
import { ChoiceCard } from './ChoiceCard';
import { AgendaCard } from './AgendaCard';
import { PlaceSuggestionCard } from './PlaceSuggestionCard';
import { MatchSuggestionCard } from './MatchSuggestionCard';
import { PlaydateDraftCard } from './PlaydateDraftCard';
import { QuotaNoticeCard } from './QuotaNoticeCard';

/**
 * Tool UI Cards of one assistant reply (unknown card types are ignored)
 *
 * @param {Object} message - Assistant message ({ id, cards })
 * @param {(messageId: string, card: Object, answer: Object) => void} onChoose
 * @param {(childId: string, forChildId?: string) => void} onViewChild - forChildId = own child the matches were searched for
 * @param {(place: Object) => void} onUsePlace
 * @param {boolean} [isPlanActive] - A playdate is being planned: cards of a closed plan are locked
 * @param {string|null} [latestDraftMessageId] - Message of the current summary card (older ones show a previous plan)
 * @param {boolean} [disabled] - A message is being sent
 */
export const ToolCardList = ({
  message,
  onChoose,
  onViewChild,
  onUsePlace,
  isPlanActive = false,
  latestDraftMessageId = null,
  disabled = false,
}) =>
  message.cards.map((card, index) => {
    const key = `${card.type}-${card.stepId || index}`;
    const isPlanLocked = AI_PLAN_STEPS.includes(card.stepId) && !isPlanActive;
    const choose = (answer) => onChoose(message.id, card, answer);
    switch (card.type) {
      case AI_CARD_TYPES.CHOICES:
        if (card.stepId === AI_STEPS.AGENDA) {
          return <AgendaCard key={key} card={card} disabled={disabled || isPlanLocked} onChoose={choose} />;
        }
        return (
          <ChoiceCard key={key} card={card} disabled={disabled || isPlanLocked} onViewChild={onViewChild} onChoose={choose} />
        );
      case AI_CARD_TYPES.PLACE_SUGGESTIONS:
        return <PlaceSuggestionCard key={key} items={card.items} onUsePlace={onUsePlace} disabled={disabled} />;
      case AI_CARD_TYPES.MATCH_SUGGESTIONS:
        return (
          <MatchSuggestionCard
            key={key}
            items={card.items}
            onViewChild={(childId) => onViewChild(childId, card.forChildId)}
          />
        );
      case AI_CARD_TYPES.PLAYDATE_DRAFT:
        return (
          <PlaydateDraftCard
            key={key}
            card={card}
            disabled={disabled || isPlanLocked || message.id !== latestDraftMessageId}
            onConfirm={() => choose({ optionIds: [AI_OPTION_IDS.CREATE_PLAYDATE], label: 'Xác nhận tạo lịch hẹn' })}
          />
        );
      case AI_CARD_TYPES.QUOTA_NOTICE:
        return <QuotaNoticeCard key={key} feature={card.feature} />;
      default:
        return null;
    }
  });

ToolCardList.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(PropTypes.shape({ type: PropTypes.string.isRequired })).isRequired,
  }).isRequired,
  onChoose: PropTypes.func.isRequired,
  onViewChild: PropTypes.func.isRequired,
  onUsePlace: PropTypes.func.isRequired,
  isPlanActive: PropTypes.bool,
  latestDraftMessageId: PropTypes.string,
  disabled: PropTypes.bool,
};

export default ToolCardList;

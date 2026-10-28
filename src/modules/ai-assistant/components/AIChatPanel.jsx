import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin } from 'lucide-react';
import ChildProfileDetailModal from '../../discovery/components/ChildProfileDetailModal';
import { useAIChat } from '../hooks/useAIChat';
import { useAIQuota } from '../hooks/useAIQuota';
import { useChildConnection } from '../hooks/useChildConnection';
import { setActiveAISession } from '../redux/aiAssistantSlice';
import { MessageList } from './MessageList';
import { QuickPrompts } from './QuickPrompts';
import { QuotaBanner } from './QuotaBanner';
import { ChatComposer } from './ChatComposer';
import { AIMascotAvatar } from './AIMascotAvatar';
import { AI_CARD_TYPES } from '../constants/aiAssistantConstants';

/**
 * The assistant conversation, shared by the full-screen page and the slide-out drawer:
 * header, messages with their Tool UI Cards, quota banner and composer.
 *
 * @param {'page'|'drawer'} [variant='page']
 * @param {React.ReactNode} [headerActions] - Extra buttons in the header (e.g. history toggle, full screen)
 */
export const AIChatPanel = ({ variant = 'page', headerActions }) => {
  const dispatch = useDispatch();
  const isDrawer = variant === 'drawer';
  const sessionId = useSelector((state) => state.aiAssistant.activeSessionId);
  const area = useSelector((state) => state.parent.profile?.location?.area);
  const chat = useAIChat(sessionId);
  const quota = useAIQuota();
  // { childId, forChildId } of the profile opened from a card
  const [childToView, setChildToView] = useState(null);
  const connection = useChildConnection(childToView);

  // A conversation that already answered once used its unit: it keeps working when the quota runs out
  const isSessionBilled = (chat.session?.messageCount || 0) > 0;
  const isBlockedByQuota = quota.isExhausted && !isSessionBilled;
  const startNewSession = useCallback(() => dispatch(setActiveAISession(null)), [dispatch]);

  // Only the latest summary of the current plan can be confirmed
  const latestDraftMessageId = useMemo(
    () => chat.messages.findLast((m) => m.cards?.some((card) => card.type === AI_CARD_TYPES.PLAYDATE_DRAFT))?.id || null,
    [chat.messages],
  );
  const cardHandlers = useMemo(
    () => ({
      onChoose: (messageId, card, answer) => chat.choose(messageId, card, answer),
      onViewChild: (childId, forChildId) => setChildToView({ childId, forChildId }),
      onUsePlace: (place) => chat.send(`Mình muốn lên kế hoạch hẹn chơi ở ${place.name}`),
      isPlanActive: Boolean(chat.planDraft),
      latestDraftMessageId,
    }),
    [chat, latestDraftMessageId],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-container-lowest">
      <header className="flex items-center gap-3 border-b border-hairline bg-surface-container-lowest px-4 py-3 sm:px-5">
        <AIMascotAvatar size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm sm:text-base font-semibold leading-tight text-on-surface">
            {chat.session?.title || 'Trợ lý AI BuddyLink'}
          </h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="w-2 h-2 shrink-0 rounded-full bg-primary" />
            <span className="font-medium text-primary">BuddyLink AI</span>
          </p>
        </div>
        {area && !isDrawer && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-secondary-border bg-secondary-soft px-2.5 py-1 text-label-sm text-secondary-dark">
            <MapPin className="w-3 h-3" /> {area}
          </span>
        )}
        {headerActions}
      </header>

      <MessageList
        messages={chat.messages}
        isLoading={chat.isLoading}
        isSending={chat.isSending}
        onRetry={chat.retry}
        onStartNew={startNewSession}
        cardHandlers={cardHandlers}
        emptyState={<QuickPrompts onPick={chat.send} disabled={chat.isSending || isBlockedByQuota} compact={isDrawer} />}
      />

      <div className="space-y-2 border-t border-hairline bg-surface-container-lowest px-3 py-3 sm:px-5">
        <div className="mx-auto max-w-ai-thread space-y-2">
          <QuotaBanner quota={quota} messagesLeft={chat.messagesLeft} isSessionBilled={isSessionBilled} compact={isDrawer} />
          <ChatComposer onSend={chat.send} disabled={chat.isSending || chat.isSessionFull || isBlockedByQuota} />
        </div>
      </div>

      <ChildProfileDetailModal
        childId={childToView?.childId || null}
        onClose={() => setChildToView(null)}
        onSwipe={connection.swipe}
        isSwiping={connection.isSwiping}
      />
    </div>
  );
};

AIChatPanel.propTypes = {
  variant: PropTypes.oneOf(['page', 'drawer']),
  headerActions: PropTypes.node,
};

export default AIChatPanel;

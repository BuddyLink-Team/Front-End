import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSafetyActions } from '../../safety/hooks/useSafetyActions.js';
import { BLOCK_REASONS } from '../../safety/constants/safety.constants.js';
import { fetchConversationById, fetchConversations } from '../redux/chatSlice.js';

/**
 * Block state of a direct conversation and the block / unblock actions on its partner.
 * The local value shows the result at once; the conversation is then refetched.
 * @param {Object} conversation - Conversation with partner, isBlockedByMe, isBlockedByPartner
 */
export const useConversationBlock = (conversation) => {
  const dispatch = useDispatch();
  const { isBlockSubmitting: isSubmitting, blockUser, unblockUser } = useSafetyActions();
  const [localBlockedByMe, setLocalBlockedByMe] = useState(null);

  const conversationId = conversation?.id;
  const partnerId = conversation?.partner?.id || conversation?.partner?._id;
  const partnerName = conversation?.partner?.fullName;

  useEffect(() => {
    setLocalBlockedByMe(null);
  }, [conversationId]);

  const refresh = useCallback(() => {
    if (conversationId) dispatch(fetchConversationById(conversationId));
    dispatch(fetchConversations());
  }, [dispatch, conversationId]);

  const runAndRefresh = useCallback(
    async (action, blockedByMe) => {
      const result = await action(partnerId, partnerName);
      if (result.success) {
        setLocalBlockedByMe(blockedByMe);
        refresh();
      }
      return result;
    },
    [partnerId, partnerName, refresh],
  );

  const block = useCallback(
    () => runAndRefresh((id, name) => blockUser(id, name, BLOCK_REASONS.CHAT), true),
    [runAndRefresh, blockUser],
  );
  const unblock = useCallback(() => runAndRefresh(unblockUser, false), [runAndRefresh, unblockUser]);

  return {
    isSubmitting,
    isBlockedByMe: localBlockedByMe ?? Boolean(conversation?.isBlockedByMe),
    isBlockedByPartner: Boolean(conversation?.isBlockedByPartner),
    block,
    unblock,
  };
};

export default useConversationBlock;

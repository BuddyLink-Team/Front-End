import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import chatApi from '../api/chatApi.js';
import playdateApi from '../../playdate/api/playdateApi.js';
import { useToast } from '../../../hooks/useToast.js';
import { getApiErrorMsg } from '../../../utils/errorUtils.js';
import { CHAT_ERROR_MESSAGES, PLAYDATE_PARTICIPANT_STATUS } from '../constants/chat.constants.js';
import { PLAYDATE_ERROR_MESSAGES } from '../../playdate/constants/playdate.constants.js';
import { pollVoted, messageReceived } from '../redux/chatSlice.js';

/**
 * Time polls of a playdate group chat (BUD-49 D5): create, vote, and the suggested time slots.
 * Errors are shown as a toast here; the callers get null and need no try/catch.
 */
export const usePoll = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();

  /**
   * @returns {Promise<Object|null>} The updated poll, null when the vote failed
   */
  const votePoll = useCallback(
    async (messageId, optionId) => {
      try {
        setIsSubmitting(true);
        const res = await chatApi.votePoll(messageId, optionId);
        const poll = res?.data?.poll || null;
        if (poll) dispatch(pollVoted({ messageId, poll }));
        return poll;
      } catch (err) {
        toast.error(getApiErrorMsg(CHAT_ERROR_MESSAGES, err, 'Không thể gửi bình chọn.'));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * @returns {Promise<Object|null>} The poll message, null when it was not created
   */
  const createPoll = useCallback(
    async (conversationId, payload) => {
      try {
        setIsSubmitting(true);
        const res = await chatApi.createPoll(conversationId, payload);
        // The API answers with the message itself; the socket copy that follows is merged by id
        const message = res?.data || null;
        if (message?.id) dispatch(messageReceived({ message, isMine: true }));
        toast.success('Đã tạo khảo sát bình chọn giờ hẹn.');
        return message;
      } catch (err) {
        toast.error(getApiErrorMsg(CHAT_ERROR_MESSAGES, err, 'Không thể tạo cuộc khảo sát.'));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * Time slots fitting the host and the families who joined the playdate (same suggestions as the form)
   * @param {Object} playdate
   * @returns {Promise<Array<Object>>} Empty when there is no suggestion or the request failed
   */
  const getSuggestedSlots = useCallback(
    async (playdate) => {
      const childId = playdate?.hostChild?.id || playdate?.hostChildId;
      if (!childId) return [];
      const participantChildIds = (playdate.participants || [])
        .filter((participant) => participant.status === PLAYDATE_PARTICIPANT_STATUS.ACCEPTED)
        .map((participant) => participant.childId || participant.child?.id)
        .filter(Boolean)
        .join(',');
      try {
        const res = await playdateApi.getTimeSlotSuggestions({
          childId: String(childId),
          participantChildIds: participantChildIds || undefined,
          durationMinutes: playdate.durationMinutes || undefined,
        });
        return res?.data?.slots || [];
      } catch (err) {
        toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Không thể lấy gợi ý khung giờ.'));
        return [];
      }
    },
    [toast]
  );

  return { votePoll, createPoll, getSuggestedSlots, isSubmitting };
};

export default usePoll;

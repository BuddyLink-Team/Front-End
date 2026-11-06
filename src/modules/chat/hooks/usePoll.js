import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import chatApi from '../api/chatApi.js';
import { useToast } from '../../../hooks/useToast.js';
import { getApiErrorMsg } from '../../../utils/errorUtils.js';
import { CHAT_ERROR_MESSAGES } from '../constants/chat.constants.js';
import { pollVoted, messageReceived, conversationUpdated } from '../redux/chatSlice.js';

/**
 * Hook to manage chat poll creation and voting (BUD-49 D5).
 * Encapsulates chatApi poll operations so UI components never call APIs directly.
 */
export const usePoll = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const dispatch = useDispatch();

  const votePoll = useCallback(
    async (messageId, optionId) => {
      try {
        setIsSubmitting(true);
        const res = await chatApi.votePoll(messageId, optionId);
        const poll = res.data?.data?.poll || res.data?.poll;
        if (poll) {
          dispatch(pollVoted({ messageId, poll }));
        }
        return poll;
      } catch (err) {
        toast.error(getApiErrorMsg(CHAT_ERROR_MESSAGES, err, 'Không thể gửi bình chọn.'));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, toast]
  );

  const createPoll = useCallback(
    async (conversationId, payload) => {
      try {
        setIsSubmitting(true);
        const res = await chatApi.createPoll(conversationId, payload);
        const resData = res.data?.data || res.data;
        if (resData?.message) {
          dispatch(messageReceived(resData.message));
        }
        if (resData?.conversation) {
          dispatch(conversationUpdated(resData.conversation));
        }
        toast.success('Đã tạo khảo sát bình chọn giờ hẹn.');
        return resData;
      } catch (err) {
        toast.error(getApiErrorMsg(CHAT_ERROR_MESSAGES, err, 'Không thể tạo cuộc khảo sát.'));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [dispatch, toast]
  );

  return {
    votePoll,
    createPoll,
    isSubmitting,
  };
};

export default usePoll;


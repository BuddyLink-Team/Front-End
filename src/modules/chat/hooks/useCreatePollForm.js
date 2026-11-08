import { useState, useCallback } from 'react';
import { useToast } from '../../../hooks/useToast.js';
import { usePoll } from './usePoll.js';
import { DEFAULT_POLL_QUESTION, POLL_LIMITS } from '../constants/chat.constants.js';
import { pollOptionFromSlot, toPollPayload } from '../utils/chatMessageUtils.js';

const emptyOption = () => ({ label: '', date: null, time: null });

/**
 * Form of the "Tạo khảo sát giờ hẹn" modal: question, 2-5 options typed or filled from the time
 * suggestions of the playdate (they keep their date and time), then the poll is posted in the chat.
 * @param {{ conversationId: string, playdate?: Object, onCreated?: (message: Object) => void }} input
 */
export const useCreatePollForm = ({ conversationId, playdate, onCreated }) => {
  const toast = useToast();
  const { createPoll, getSuggestedSlots, isSubmitting } = usePoll();
  const [question, setQuestion] = useState(DEFAULT_POLL_QUESTION);
  const [options, setOptions] = useState([emptyOption(), emptyOption()]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // A typed option is no longer the suggested slot it came from
  const changeOption = useCallback((index, label) => {
    setOptions((prev) => prev.map((option, i) => (i === index ? { label, date: null, time: null } : option)));
  }, []);

  const addOption = useCallback(() => {
    setOptions((prev) => (prev.length >= POLL_LIMITS.MAX_OPTIONS ? prev : [...prev, emptyOption()]));
  }, []);

  const removeOption = useCallback((index) => {
    setOptions((prev) => (prev.length <= POLL_LIMITS.MIN_OPTIONS ? prev : prev.filter((_, i) => i !== index)));
  }, []);

  const fillSuggestedSlots = useCallback(async () => {
    setIsLoadingSlots(true);
    const slots = await getSuggestedSlots(playdate);
    setIsLoadingSlots(false);
    if (!slots.length) {
      toast.error('Chưa có khung giờ gợi ý phù hợp, bạn nhập tay nhé.');
      return;
    }
    const suggested = slots
      .slice(0, POLL_LIMITS.SUGGESTED_OPTIONS)
      .map((slot) => pollOptionFromSlot(slot, slot.durationMinutes || playdate?.durationMinutes));
    setOptions(suggested.length >= POLL_LIMITS.MIN_OPTIONS ? suggested : [...suggested, emptyOption()]);
  }, [getSuggestedSlots, playdate, toast]);

  /**
   * @returns {Promise<boolean>} true when the poll was created
   */
  const submit = useCallback(async () => {
    const payload = toPollPayload({ question, options });
    if (!payload.question) {
      toast.error('Vui lòng nhập câu hỏi bình chọn.');
      return false;
    }
    if (payload.options.length < POLL_LIMITS.MIN_OPTIONS) {
      toast.error(`Cần ít nhất ${POLL_LIMITS.MIN_OPTIONS} phương án bình chọn.`);
      return false;
    }
    const message = await createPoll(conversationId, payload);
    if (message) onCreated?.(message);
    return Boolean(message);
  }, [question, options, createPoll, conversationId, onCreated, toast]);

  return {
    question,
    setQuestion,
    options,
    changeOption,
    addOption,
    removeOption,
    canAddOption: options.length < POLL_LIMITS.MAX_OPTIONS,
    canRemoveOption: options.length > POLL_LIMITS.MIN_OPTIONS,
    canSuggestSlots: Boolean(playdate?.hostChild?.id || playdate?.hostChildId),
    fillSuggestedSlots,
    isLoadingSlots,
    isSubmitting,
    submit,
  };
};

export default useCreatePollForm;

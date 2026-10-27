import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { cancelPlaydate, leavePlaydate } from '../../playdate/redux/playdateSlice';
import { PLAYDATE_ERROR_MESSAGES } from '../../playdate/constants/playdateConstants';
import { BLOCKED_MEMBER_CANCEL_REASON, BLOCKED_MEMBER_PROMPT_STEPS } from '../constants/chatConstants.js';

/**
 * Prompt of a playdate group chat when the parent blocked one of its members: stay in the chat,
 * or leave the playdate. The host cannot leave, so for the host "leave" cancels the playdate
 * for every family (the dialog says so).
 * @param {Object} params
 * @param {Object} params.conversation - Playdate conversation with playdate and blockedByMeParticipants
 * @param {string} params.currentParentId
 * @param {Function} [params.onLeft] - Called once the parent left (or cancelled) the playdate
 */
export const useBlockedMemberPrompt = ({ conversation, currentParentId, onLeft }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [step, setStep] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  const conversationId = conversation?.id;
  const playdate = conversation?.playdate;
  const blockedMembers = conversation?.blockedByMeParticipants || [];
  const blockedCount = blockedMembers.length;
  const blockedNames = blockedMembers.map((p) => p.fullName || 'thành viên').join(', ');
  const isHost = Boolean(playdate?.host?.id) && String(playdate.host.id) === String(currentParentId);

  // Ask again whenever another conversation opens or the list of blocked members changes
  useEffect(() => {
    setStep(blockedCount > 0 ? BLOCKED_MEMBER_PROMPT_STEPS.ASK_CONTINUE : null);
  }, [conversationId, blockedCount]);

  const stay = useCallback(() => setStep(null), []);
  const askLeave = useCallback(() => setStep(BLOCKED_MEMBER_PROMPT_STEPS.ASK_LEAVE), []);
  const backToContinue = useCallback(() => setStep(BLOCKED_MEMBER_PROMPT_STEPS.ASK_CONTINUE), []);

  const leave = useCallback(async () => {
    if (!playdate?.id) return;
    setIsLeaving(true);
    try {
      if (isHost) {
        await dispatch(cancelPlaydate({ id: playdate.id, reason: BLOCKED_MEMBER_CANCEL_REASON })).unwrap();
        toast.success('Đã hủy buổi hẹn playdate.');
      } else {
        await dispatch(leavePlaydate(playdate.id)).unwrap();
        toast.success('Bạn đã rời khỏi buổi hẹn playdate.');
      }
      setStep(null);
      onLeft?.();
    } catch (err) {
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MESSAGES, err, 'Không thể rời buổi hẹn playdate. Vui lòng thử lại.'));
      setStep(BLOCKED_MEMBER_PROMPT_STEPS.ASK_CONTINUE);
    } finally {
      setIsLeaving(false);
    }
  }, [dispatch, toast, playdate?.id, isHost, onLeft]);

  return { step, blockedNames, isHost, isLeaving, stay, askLeave, backToContinue, leave };
};

export default useBlockedMemberPrompt;

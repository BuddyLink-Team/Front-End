import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import {
  fetchPlaydateDetail,
  fetchRescheduleRequest,
  completePlaydate,
  cancelPlaydate,
  respondToPlaydate,
  voteRescheduleRequest,
} from '../redux/playdateSlice';
import { PLAYDATE_ERROR_MAP, RESCHEDULE_STATUS } from '../constants/playdateConstants';
import { hasPlaydateStarted } from '../utils/playdateTime';

/**
 * Playdate detail page: RSVP, complete, cancel and the reschedule vote (PROJECT_OVERVIEW 6.2).
 * API calls live in the playdate slice thunks.
 */
export const usePlaydateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const {
    selectedPlaydate: playdate,
    rescheduleRequest: rescheduleReq,
    isDetailLoading,
    isActionLoading,
  } = useSelector((state) => state.playdate);
  // Only show the playdate that matches the URL
  const currentPlaydate = playdate?.id === id ? playdate : null;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const fetchDetail = useCallback(async () => {
    setHasLoadFailed(false);
    try {
      await dispatch(fetchPlaydateDetail(id)).unwrap();
    } catch (err) {
      setHasLoadFailed(true);
      toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể tải thông tin chi tiết buổi hẹn chơi.'));
      return;
    }
    // Having no reschedule request is normal: failures are ignored here
    dispatch(fetchRescheduleRequest(id));
  }, [dispatch, id, toast]);

  useEffect(() => {
    if (id) fetchDetail();
  }, [id, fetchDetail]);

  const isHost = Boolean(currentPlaydate?.isHost);
  const isUpcoming = currentPlaydate?.status === 'upcoming';
  const isCancelled = currentPlaydate?.status === 'cancelled';
  const isCompleted = currentPlaydate?.status === 'completed';

  // Section 6.2: only the host proposes; voters are the accepted participants (myVote from the API)
  const canReschedule = isHost && isUpcoming;
  // Completing is possible only after the start time
  const canComplete = isHost && isUpcoming && hasPlaydateStarted(currentPlaydate?.scheduledDate, currentPlaydate?.time);
  const pendingReschedule = rescheduleReq?.status === RESCHEDULE_STATUS.PENDING ? rescheduleReq : null;
  const myPendingVote = pendingReschedule?.myVote === 'pending';
  // Latest decided request (accepted / declined), shown so the host learns the outcome
  const resolvedReschedule =
    rescheduleReq && [RESCHEDULE_STATUS.ACCEPTED, RESCHEDULE_STATUS.DECLINED].includes(rescheduleReq.status)
      ? rescheduleReq
      : null;

  // Group chat members are the host and accepted participants
  const canOpenGroupChat =
    Boolean(currentPlaydate?.chatConversationId) && (isHost || currentPlaydate?.myParticipantStatus === 'accepted');

  const runAction = useCallback(
    async (thunkAction, successMessage, fallbackError) => {
      try {
        const result = await dispatch(thunkAction).unwrap();
        if (successMessage) toast.success(successMessage);
        return result;
      } catch (err) {
        toast.error(getApiErrorMsg(PLAYDATE_ERROR_MAP, err, fallbackError));
        return null;
      }
    },
    [dispatch, toast],
  );

  const handleComplete = () =>
    runAction(completePlaydate(id), 'Đã xác nhận hoàn thành buổi hẹn chơi thành công!', 'Không thể cập nhật trạng thái hoàn thành.');

  const handleCancel = async () => {
    const result = await runAction(
      cancelPlaydate({ id, reason: cancelReason || 'Hủy bởi người tổ chức' }),
      'Đã hủy buổi hẹn chơi.',
      'Không thể hủy buổi hẹn chơi.',
    );
    if (result) {
      setShowCancelModal(false);
      dispatch(fetchRescheduleRequest(id));
    }
  };

  const handleRespond = async (status) => {
    const result = await runAction(
      respondToPlaydate({ id, status }),
      status === 'accepted'
        ? 'Đã đồng ý tham gia! Cuộc hẹn đã được thêm vào lịch của bạn.'
        : 'Đã từ chối lời mời tham gia buổi hẹn.',
      'Không thể gửi phản hồi lời mời tham gia.',
    );
    // Accepting may make the parent a voter of a pending reschedule
    if (result) dispatch(fetchRescheduleRequest(id));
  };

  const handleVoteReschedule = (voteStatus) => {
    if (!pendingReschedule) return null;
    return runAction(
      // Vote on the request the parent is looking at, never on a newer one
      voteRescheduleRequest({ id, requestId: pendingReschedule.id, status: voteStatus }),
      voteStatus === 'accepted' ? 'Bạn đã đồng ý với lịch hẹn mới đề xuất.' : 'Bạn đã từ chối lịch hẹn mới đề xuất.',
      'Không thể gửi ý kiến bỏ phiếu dời lịch.',
    );
  };

  const handleRescheduleSuccess = () => {
    setShowRescheduleModal(false);
  };

  return {
    id,
    playdate: currentPlaydate,
    rescheduleReq: pendingReschedule,
    resolvedReschedule,
    isLoading: isDetailLoading || (!currentPlaydate && !hasLoadFailed),
    isActionLoading,
    isHost,
    isUpcoming,
    isCancelled,
    isCompleted,
    canReschedule,
    canComplete,
    canOpenGroupChat,
    myPendingVote,
    showCancelModal,
    cancelReason,
    showRescheduleModal,
    setShowCancelModal,
    setCancelReason,
    setShowRescheduleModal,
    handleComplete,
    handleCancel,
    handleRespond,
    handleVoteReschedule,
    handleRescheduleSuccess,
    navigate,
  };
};

export default usePlaydateDetail;

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { playdateApi } from '../api/playdateApi';
import { markPlaydateCompleted } from '../redux/playdateSlice';
import { getApiErrorMsg } from '../../../utils/errorUtils';
import { PLAYDATE_ERROR_MAP } from '../../../constants/playdate.constants';

export const usePlaydateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { parent } = useSelector((state) => state.auth || {});

  const [playdate, setPlaydate] = useState(null);
  const [rescheduleReq, setRescheduleReq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modals state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pdRes, reschedRes] = await Promise.allSettled([
        playdateApi.getPlaydateById(id),
        playdateApi.getReschedule(id),
      ]);

      if (pdRes.status === 'fulfilled' && pdRes.value?.data) {
        setPlaydate(pdRes.value.data);
      }

      if (reschedRes.status === 'fulfilled' && reschedRes.value?.data) {
        setRescheduleReq(reschedRes.value.data);
      } else {
        setRescheduleReq(null);
      }
    } catch (err) {
      const msg = getApiErrorMsg(
        PLAYDATE_ERROR_MAP,
        err,
        'Không thể tải thông tin chi tiết buổi hẹn chơi.'
      );
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id, fetchDetail]);

  const isHost = Boolean(playdate?.isHost);
  const isUpcoming = playdate?.status === 'upcoming';
  const isCancelled = playdate?.status === 'cancelled';
  const isCompleted = playdate?.status === 'completed';

  // Current parent identification
  const currentParentId =
    (parent?.id || parent?._id || (playdate?.isHost ? playdate?.hostParent?.id : null))?.toString();

  // Review 3 / Comment 13-14: Correctly check if current user has a pending vote
  const myPendingVote =
    rescheduleReq?.status === 'pending' &&
    rescheduleReq.responses?.find((r) => {
      const voterId = (r.parentId?._id || r.parentId?.id || r.parentId)?.toString();
      return voterId === currentParentId && r.status === 'pending';
    });

  // Review 3 / Comment 15 & Spec 6.2: Only host can propose a reschedule
  const canReschedule = isHost && isUpcoming;

  // Actions
  const handleComplete = async () => {
    setIsActionLoading(true);
    try {
      const response = await playdateApi.completePlaydate(id);
      const updated = response?.data || response;
      setPlaydate((prev) => ({
        ...prev,
        ...updated,
        status: 'completed',
        displayStatus: 'completed',
      }));
      dispatch(markPlaydateCompleted(updated));
      toast.success('Đã xác nhận hoàn thành buổi hẹn chơi thành công!');
    } catch (err) {
      const msg = getApiErrorMsg(
        PLAYDATE_ERROR_MAP,
        err,
        'Không thể cập nhật trạng thái hoàn thành.'
      );
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsActionLoading(true);
    try {
      const response = await playdateApi.cancelPlaydate(id, {
        reason: cancelReason || 'Hủy bởi người tổ chức',
      });
      const updated = response?.data || response;
      setPlaydate((prev) => ({
        ...prev,
        ...updated,
        status: 'cancelled',
        displayStatus: 'cancelled',
      }));
      setShowCancelModal(false);
      toast.success('Đã hủy buổi hẹn chơi.');
    } catch (err) {
      const msg = getApiErrorMsg(PLAYDATE_ERROR_MAP, err, 'Không thể hủy buổi hẹn chơi.');
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRespond = async (status) => {
    setIsActionLoading(true);
    try {
      const response = await playdateApi.respondToPlaydate(id, status);
      const updated = response?.data || response;
      setPlaydate(updated);
      toast.success(
        status === 'accepted'
          ? 'Đã đồng ý tham gia! Cuộc hẹn đã được thêm vào lịch của bạn.'
          : 'Đã từ chối lời mời tham gia buổi hẹn.'
      );
    } catch (err) {
      const msg = getApiErrorMsg(
        PLAYDATE_ERROR_MAP,
        err,
        'Không thể gửi phản hồi lời mời tham gia.'
      );
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleVoteReschedule = async (voteStatus) => {
    setIsActionLoading(true);
    try {
      const res = await playdateApi.voteReschedule(id, {
        status: voteStatus,
      });
      const data = res?.data || res;
      if (data?.playdate) setPlaydate(data.playdate);
      if (data?.rescheduleRequest) setRescheduleReq(data.rescheduleRequest);

      toast.success(
        voteStatus === 'accepted'
          ? 'Bạn đã đồng ý với lịch hẹn mới đề xuất.'
          : 'Bạn đã từ chối lịch hẹn mới đề xuất.'
      );
      fetchDetail();
    } catch (err) {
      const msg = getApiErrorMsg(
        PLAYDATE_ERROR_MAP,
        err,
        'Không thể gửi ý kiến bỏ phiếu dời lịch.'
      );
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRescheduleSuccess = () => {
    setShowRescheduleModal(false);
    fetchDetail();
  };

  return {
    id,
    playdate,
    rescheduleReq,
    isLoading,
    isActionLoading,
    isHost,
    isUpcoming,
    isCancelled,
    isCompleted,
    canReschedule,
    myPendingVote,
    currentParentId,
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

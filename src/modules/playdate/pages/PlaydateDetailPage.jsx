import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Baby,
  Trash2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/Button';
import { Avatar } from '../../../components/ui/Avatar';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { RescheduleModal } from '../components/RescheduleModal';
import { playdateApi } from '../api/playdateApi';
import { formatDate } from '../../../utils/formatters';

export const PlaydateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [playdate, setPlaydate] = useState(null);
  const [rescheduleReq, setRescheduleReq] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Action states
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Fetch Playdate Detail and Active Reschedule Request
  const loadPlaydateData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pdRes, reschedRes] = await Promise.allSettled([
        playdateApi.getPlaydateById(id),
        playdateApi.getReschedule(id),
      ]);

      if (pdRes.status === 'fulfilled' && pdRes.value?.data?.data) {
        setPlaydate(pdRes.value.data.data);
      } else {
        toast.error('Không tìm thấy thông tin buổi hẹn');
        navigate('/playdates');
        return;
      }

      if (reschedRes.status === 'fulfilled' && reschedRes.value?.data?.data) {
        setRescheduleReq(reschedRes.value.data.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải thông tin buổi hẹn');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadPlaydateData();
  }, [loadPlaydateData]);

  // Host Completes Playdate
  const handleComplete = async () => {
    setIsActionLoading(true);
    try {
      await playdateApi.completePlaydate(id);
      toast.success('🎉 Buổi hẹn chơi đã được hoàn thành!');
      loadPlaydateData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể hoàn thành buổi hẹn';
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Host Cancels Playdate
  const handleCancelPlaydate = async () => {
    setIsActionLoading(true);
    try {
      await playdateApi.cancelPlaydate(id, { reason: cancelReason || 'Hủy bởi người tổ chức' });
      toast.success('Đã hủy buổi hẹn chơi.');
      setShowCancelModal(false);
      loadPlaydateData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể hủy buổi hẹn';
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Participant responds to RSVP (accept / decline)
  const handleRSVP = async (status) => {
    setIsActionLoading(true);
    try {
      await playdateApi.respondToPlaydate(id, status);
      toast.success(
        status === 'accepted'
          ? '🎉 Bạn đã chấp nhận tham gia buổi hẹn chơi!'
          : 'Đã gửi từ chối lời mời.'
      );
      loadPlaydateData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lỗi khi gửi phản hồi RSVP';
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Vote on active reschedule request
  const handleVoteReschedule = async (status) => {
    setIsActionLoading(true);
    try {
      await playdateApi.voteReschedule(id, {
        requestId: rescheduleReq?._id || rescheduleReq?.id,
        status,
      });
      toast.success(
        status === 'accepted'
          ? 'Bạn đã đồng ý với thời gian mới!'
          : 'Bạn đã từ chối đổi lịch. Buổi hẹn sẽ giữ lịch cũ.'
      );
      loadPlaydateData();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Lỗi khi bỏ phiếu đổi lịch';
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded-xl w-1/3" />
        <div className="h-64 bg-gray-100 rounded-3xl" />
        <div className="h-48 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  if (!playdate) return null;

  const isHost = playdate.isHost;
  const isUpcoming = playdate.status === 'upcoming';
  const isCancelled = playdate.status === 'cancelled';
  const isCompleted = playdate.status === 'completed';

  // Check if current user has voted on active reschedule
  const myPendingVote =
    rescheduleReq?.status === 'pending' &&
    rescheduleReq.responses?.find((r) => {
      const voterId = r.parentId?._id || r.parentId?.id || r.parentId;
      return r.status === 'pending';
    });

  // Calculate accepted participants count
  const acceptedCount = (playdate.participants || []).filter(
    (p) => p.status === 'accepted'
  ).length;

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/playdates')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="rounded-xl border border-hairline hover:bg-white"
          >
            Danh sách
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                {playdate.activity}
              </h1>
              {/* Status Badge */}
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isCompleted
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : isCancelled
                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                    : playdate.displayStatus === 'confirmed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isCompleted
                  ? 'Đã hoàn thành'
                  : isCancelled
                  ? 'Đã hủy'
                  : playdate.displayStatus === 'confirmed'
                  ? 'Đã xác nhận'
                  : 'Đang chờ phản hồi'}
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Mã buổi hẹn: <code className="font-mono text-gray-500">{playdate.id}</code>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {playdate.chatConversationId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/chat/${playdate.chatConversationId}`)}
              leftIcon={<MessageCircle className="w-4 h-4 text-primary" />}
              className="rounded-xl border-primary/30 text-primary-dark hover:bg-primary/5"
            >
              Nhóm chat Playdate
            </Button>
          )}

          {isUpcoming && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRescheduleModal(true)}
              leftIcon={<RefreshCw className="w-4 h-4 text-amber-600" />}
              className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Đổi lịch hẹn
            </Button>
          )}

          {isHost && isUpcoming && (
            <>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleComplete}
                isLoading={isActionLoading}
                leftIcon={<Check className="w-4 h-4" />}
                className="rounded-xl shadow-2xs"
              >
                Hoàn thành
              </Button>
              {/* Nút Hủy hẹn (Danger) */}
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="rounded-xl shadow-2xs"
              >
                Hủy hẹn
              </Button>
            </>
          )}
        </div>
      </div>

      {/* PARTICIPANT RSVP BANNER (Nếu là participant và chưa trả lời) */}
      {!isHost && isUpcoming && playdate.myParticipantStatus === 'pending' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Bạn nhận được lời mời tham gia Playdate này!
              </h4>
              <p className="text-xs text-amber-800/80 mt-0.5">
                Vui lòng xác nhận để phụ huynh tổ chức chuẩn bị không gian chơi tốt nhất cho các bé.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRSVP('declined')}
              disabled={isActionLoading}
              className="rounded-xl border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              Từ chối
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleRSVP('accepted')}
              isLoading={isActionLoading}
              leftIcon={<Check className="w-4 h-4" />}
              className="rounded-xl shadow-xs"
            >
              Chấp nhận tham gia
            </Button>
          </div>
        </div>
      )}

      {/* ACTIVE RESCHEDULE REQUEST BANNER (Nếu có đề xuất đang chờ) */}
      {rescheduleReq && rescheduleReq.status === 'pending' && (
        <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-text-primary">
                    Đang có đề xuất đổi lịch hẹn mới
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                    Chờ đồng thuận
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  Đề xuất bởi: <strong>{rescheduleReq.requestedBy?.fullName}</strong>
                  {rescheduleReq.reason && ` • "${rescheduleReq.reason}"`}
                </p>
              </div>
            </div>

            {/* Voting buttons if current user can vote */}
            {myPendingVote && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoteReschedule('declined')}
                  disabled={isActionLoading}
                  className="rounded-xl border-amber-300 text-amber-800 hover:bg-white"
                >
                  Từ chối
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleVoteReschedule('accepted')}
                  isLoading={isActionLoading}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="rounded-xl shadow-xs"
                >
                  Đồng ý lịch mới
                </Button>
              </div>
            )}
          </div>

          {/* New details preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white/80 rounded-2xl border border-hairline text-xs">
            <div className="flex items-center gap-2 text-text-primary">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span>
                Ngày mới: <strong>{formatDate(rescheduleReq.newDate)}</strong> ({rescheduleReq.newStartTime})
              </span>
            </div>
            {rescheduleReq.newLocation?.name && (
              <div className="flex items-center gap-2 text-text-primary truncate">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">
                  Địa điểm: <strong>{rescheduleReq.newLocation.name}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAIN WHITE CARD: DATE, TIME & LOCATION */}
      <div className="bg-white border border-hairline rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2 border-b border-hairline pb-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          Thời gian & Địa điểm tổ chức
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time Card */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline space-y-2">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Thời gian gặp gỡ
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-base font-bold text-text-primary">
                <CalendarIcon className="w-4 h-4 text-primary" />
                <span>{formatDate(playdate.scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Clock className="w-4 h-4 text-secondary-dark" />
                <span>Khung giờ: <strong>{playdate.time}</strong></span>
              </div>
            </div>
          </div>

          {/* Location Card */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-hairline space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Địa điểm tổ chức
              </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${playdate.location?.name} ${playdate.location?.address}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-primary-dark inline-flex items-center gap-1 hover:underline"
              >
                Mở Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-base font-bold text-text-primary truncate">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="truncate">{playdate.location?.name}</span>
              </div>
              <p className="text-xs text-text-muted pl-6 line-clamp-2">
                {playdate.location?.address}
              </p>
            </div>
          </div>
        </div>

        {/* Host Note */}
        {playdate.note && (
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 space-y-1">
            <span className="text-xs font-bold text-primary-dark">Ghi chú từ người tổ chức:</span>
            <p className="text-sm text-text-primary leading-relaxed">{playdate.note}</p>
          </div>
        )}

        {/* Cancellation details if cancelled */}
        {isCancelled && playdate.cancellation && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-1 text-red-800">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Buổi hẹn này đã bị hủy
            </div>
            <p className="text-xs text-red-700">
              Lý do: <em>{playdate.cancellation.reason || 'Hủy bởi người tổ chức'}</em>
            </p>
          </div>
        )}
      </div>

      {/* PARTICIPANTS & RSVP STATUS CARD */}
      <div className="bg-white border border-hairline rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary-dark" />
            <h2 className="text-base font-bold text-text-primary">
              Danh sách phụ huynh & Trạng thái RSVP
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-subtle border border-hairline text-text-muted">
            {acceptedCount + 1} gia đình tham gia
          </span>
        </div>

        <div className="space-y-4">
          {/* Host Parent Row */}
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar
                src={playdate.hostParent?.avatarUrl}
                alt={playdate.hostParent?.fullName}
                size="lg"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-text-primary">
                    {playdate.hostParent?.fullName}
                  </p>
                  {playdate.hostParent?.isVerified && (
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  )}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-white">
                    Người tổ chức (Host)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Baby className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Bé tham gia: <strong>{playdate.hostChild?.displayName}</strong>
                    {playdate.hostChild?.interests?.length > 0 &&
                      ` (${playdate.hostChild.interests.slice(0, 2).join(', ')})`}
                  </span>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã xác nhận (Host)
            </span>
          </div>

          {/* Invited Participants List */}
          {playdate.participants?.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">
              Chưa có bạn bè nào được mời vào buổi hẹn này.
            </p>
          ) : (
            playdate.participants?.map((p) => {
              const pid = p.parentId;
              const isAccepted = p.status === 'accepted';
              const isDeclined = p.status === 'declined';

              return (
                <div
                  key={pid}
                  className="p-4 rounded-2xl border border-hairline bg-white hover:bg-surface-subtle/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={p.parent?.avatarUrl}
                      alt={p.parent?.fullName || 'Phụ huynh'}
                      size="md"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-text-primary">
                          {p.parent?.fullName || 'Phụ huynh'}
                        </p>
                        {p.parent?.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Baby className="w-3.5 h-3.5 text-secondary" />
                        <span>
                          Bé: <strong>{p.child?.displayName || 'Bé'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border shrink-0 self-start sm:self-center ${
                      isAccepted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : isDeclined
                        ? 'bg-gray-100 text-gray-500 border-gray-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isAccepted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Đã tham gia (Accepted)
                      </>
                    ) : isDeclined ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> Đã từ chối (Declined)
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> Đang chờ phản hồi (Pending)
                      </>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        playdate={playdate}
        onSuccess={loadPlaydateData}
      />

      {/* Cancel Playdate Confirm Dialog */}
      <ConfirmDialog
        open={showCancelModal}
        title="Hủy buổi hẹn chơi này?"
        description="Khi hủy hẹn, toàn bộ phụ huynh tham gia sẽ nhận được thông báo và cuộc hẹn sẽ dừng lại. Thao tác này không thể hoàn tác."
        confirmLabel="Xác nhận hủy hẹn"
        cancelLabel="Giữ lại lịch hẹn"
        variant="danger"
        isLoading={isActionLoading}
        onConfirm={handleCancelPlaydate}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default PlaydateDetailPage;

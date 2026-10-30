import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
  Calendar,
  CheckCircle2,
  XCircle,
  Ban,
  Trash2,
  CalendarX,
  History,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Eye,
  Send,
  Flag,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Avatar } from '../../../components/ui/Avatar';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { StatusChip } from '../../../components/badges/StatusChip';
import { ConfirmDialog } from '../../../components/feedback/ConfirmDialog';
import { Spinner } from '../../../components/feedback/Spinner';
import { Skeleton } from '../../../components/feedback/Skeleton';
import {
  REPORT_CATEGORY_LABELS,
  REPORT_SEVERITY_CONFIG,
  REPORT_SEVERITY_OPTIONS,
  REPORT_TARGET_TYPE_LABELS,
  REPORT_ACTION_LABELS,
  REPORT_RESOLUTION_LABELS,
} from '../constants/admin.constants';
import { formatDate, formatDateTime } from '../../../utils/formatters';
import { ICON_SIZE } from '../../../constants/icon.constants';

const SECTION_TITLE_CLASS =
  'text-label-lg font-semibold text-text-primary flex items-center gap-2';
const PANEL_CLASS =
  'rounded-2xl border border-hairline p-4 bg-surface-container-lowest space-y-3 text-body-md';

export const AdminReportInvestigationDrawer = ({
  open,
  onClose,
  report,
  isLoading,
  isActionLoading,
  onClaim,
  onTakeover,
  onUpdateSeverity,
  onApplyAction,
  onResolve,
  onReopen,
}) => {
  // Confirm dialog state for dangerous sanction actions
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    actionType: null,
    title: '',
    description: '',
    variant: 'danger',
    durationDays: null,
    requireReason: true,
  });

  // Lightbox preview for evidence images
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Form state for resolution
  const [resolutionStatus, setResolutionStatus] = useState('resolved');
  const [resolutionType, setResolutionType] = useState('action_taken');
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedRelatedIds, setSelectedRelatedIds] = useState([]);
  const [formError, setFormError] = useState('');

  // Reopen modal state
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reopenNote, setReopenNote] = useState('');
  const [reopenError, setReopenError] = useState('');

  // Severity quick edit
  const [isEditingSeverity, setIsEditingSeverity] = useState(false);
  const [newSeverity, setNewSeverity] = useState('');

  useEffect(() => {
    setResolutionStatus('resolved');
    setResolutionType('action_taken');
    setAdminNotes('');
    setSelectedRelatedIds([]);
    setFormError('');
    setIsEditingSeverity(false);
    setReopenNote('');
    setReopenError('');
    setIsReopenOpen(false);
    setLightboxUrl(null);
    setConfirmDialog((previous) => ({ ...previous, open: false }));
  }, [report?.id, open]);

  if (!open) return null;

  const isClosed =
    report?.status === 'resolved' || report?.status === 'dismissed';
  const isReviewing = report?.status === 'reviewing';
  const isPending = report?.status === 'pending';

  const appliedActionTypes = new Set(
    (report?.actions || []).map((a) => a.type),
  );
  const targetMessage = report?.targetContext?.reportedMessage;
  const targetPlaydate = report?.targetContext?.playdate;
  const messageUnavailable =
    report?.targetType === 'message' &&
    (!targetMessage || targetMessage.isDeleted);
  const playdateUnavailable =
    report?.targetType === 'playdate' &&
    (!targetPlaydate || targetPlaydate.status === 'cancelled');

  const handleOpenActionConfirm = (type, durationDays = null) => {
    if (!isReviewing || isActionLoading || appliedActionTypes.has(type)) return;
    if (type === 'delete_message' && messageUnavailable) return;
    if (type === 'cancel_playdate' && playdateUnavailable) return;
    let title = '';
    let description = '';
    let variant = 'danger';

    switch (type) {
      case 'warn':
        title = 'Xác nhận Cảnh cáo phụ huynh';
        description =
          'Hệ thống sẽ gửi cảnh cáo chính thức tới phụ huynh và tăng số lần vi phạm (strike count + 1).';
        variant = 'warning';
        break;
      case 'delete_message':
        title = 'Xác nhận Xóa tin nhắn vi phạm';
        description =
          'Tin nhắn này sẽ bị gỡ khỏi cuộc trò chuyện và thay thế bằng thông báo gỡ bỏ bởi Quản trị viên.';
        variant = 'danger';
        break;
      case 'cancel_playdate':
        title = 'Xác nhận Hủy cuộc hẹn Playdate';
        description =
          'Cuộc hẹn chơi sẽ bị hủy ngay lập tức, hoàn trả lượt tham gia cho các gia đình và gửi thông báo.';
        variant = 'danger';
        break;
      case 'suspend':
        title = `Xác nhận Tạm đình chỉ tài khoản ${durationDays} ngày`;
        description = `Tài khoản sẽ bị vô hiệu hóa quyền đăng nhập, hủy toàn bộ token hiện tại và ngắt kết nối trực tiếp trong vòng ${durationDays} ngày.`;
        variant = 'danger';
        break;
      case 'ban':
        title = 'Xác nhận Khóa tài khoản vĩnh viễn';
        description =
          'Tài khoản phụ huynh sẽ bị khóa vĩnh viễn, vô hiệu hóa toàn bộ quyền truy cập và xóa khỏi danh sách Khám phá.';
        variant = 'danger';
        break;
      default:
        title = 'Xác nhận thao tác';
        description = 'Thao tác này sẽ áp dụng chế tài lên tài khoản vi phạm.';
    }

    setConfirmDialog({
      open: true,
      actionType: type,
      title,
      description,
      variant,
      durationDays,
      requireReason: false,
    });
  };

  const handleConfirmAction = async (note) => {
    if (!confirmDialog.actionType || !report) return;
    const ok = await onApplyAction(report.id, {
      type: confirmDialog.actionType,
      durationDays: confirmDialog.durationDays,
      note: note || '',
    });
    if (ok) {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const trimmed = adminNotes.trim();
    if (trimmed.length < 10) {
      setFormError('Ghi chú xử lý phải có tối thiểu 10 ký tự.');
      return;
    }

    if (resolutionStatus === 'resolved' && resolutionType === 'action_taken') {
      if (!report?.actions || report.actions.length === 0) {
        setFormError(
          'Vui lòng thi hành ít nhất 1 chế tài kỷ luật trước khi chọn "Đã áp dụng chế tài". Hoặc chọn "Không kỷ luật".',
        );
        return;
      }
    }

    await onResolve(report.id, {
      status: resolutionStatus,
      resolution:
        resolutionStatus === 'dismissed' ? 'dismissed' : resolutionType,
      adminNotes: trimmed,
      applyToRelatedReportIds: selectedRelatedIds,
    });
  };

  const handleReopenSubmit = async () => {
    const trimmed = reopenNote.trim();
    if (trimmed.length < 10) {
      setReopenError('Lý do mở lại phải có tối thiểu 10 ký tự.');
      return;
    }
    const ok = await onReopen(report.id, trimmed);
    if (ok) {
      setIsReopenOpen(false);
      setReopenNote('');
    }
  };

  const toggleRelatedReport = (id) => {
    setSelectedRelatedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <>
      <Modal
        isOpen={open}
        onClose={onClose}
        placement="right"
        maxWidth="max-w-3xl"
        title="Chi tiết báo cáo vi phạm"
      >
        {isLoading || !report ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="p-6 space-y-6 pb-24">
            {/* Header */}
            <div className="border-b border-hairline pb-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-label-md font-mono text-text-muted">
                    #{report.id.slice(-8)}
                  </span>
                  <StatusChip
                    status={report.status}
                    label={
                      report.status === 'pending'
                        ? 'Chờ xử lý'
                        : report.status === 'reviewing'
                          ? 'Đang xem xét'
                          : report.status === 'resolved'
                            ? 'Đã giải quyết'
                            : 'Bác bỏ'
                    }
                  />
                  <StatusChip
                    status={
                      REPORT_SEVERITY_CONFIG[report.severity]?.variant ||
                      'neutral'
                    }
                    label={
                      REPORT_SEVERITY_CONFIG[report.severity]?.label ||
                      report.severity
                    }
                  />
                  {report.isOverdue && (
                    <span className="px-2 py-0.5 rounded-full text-label-xs font-semibold bg-error-soft text-error-dark border border-error">
                      Quá hạn SLA
                    </span>
                  )}
                </div>

                {/* State Transition Action Buttons */}
                <div className="flex items-center gap-2">
                  {isPending && (
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isActionLoading}
                      onClick={() => onClaim(report.id)}
                    >
                      Bắt đầu xử lý
                    </Button>
                  )}
                  {isReviewing && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() => onTakeover(report.id)}
                    >
                      Tiếp quản vụ việc
                    </Button>
                  )}
                  {isClosed && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isActionLoading}
                      onClick={() => setIsReopenOpen(true)}
                    >
                      <RotateCcw size={ICON_SIZE.XS} className="mr-1.5" /> Mở
                      lại vụ việc
                    </Button>
                  )}
                </div>
              </div>

              {/* Severity Quick Edit (Only in reviewing) */}
              {isReviewing && (
                <div className="flex items-center gap-2 text-body-sm pt-1">
                  <span className="text-text-muted">Mức độ nghiêm trọng:</span>
                  {!isEditingSeverity ? (
                    <button
                      type="button"
                      onClick={() => {
                        setNewSeverity(report.severity);
                        setIsEditingSeverity(true);
                      }}
                      className="text-primary hover:underline font-medium text-label-sm"
                    >
                      Thay đổi
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={newSeverity}
                        onChange={(e) => setNewSeverity(e.target.value)}
                        className="rounded-lg border border-hairline px-2 py-1 text-label-sm bg-surface"
                      >
                        {REPORT_SEVERITY_OPTIONS.filter((o) => o.value).map(
                          (opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ),
                        )}
                      </select>
                      <Button
                        size="xs"
                        variant="primary"
                        onClick={async () => {
                          if (newSeverity && newSeverity !== report.severity) {
                            await onUpdateSeverity(report.id, newSeverity);
                          }
                          setIsEditingSeverity(false);
                        }}
                      >
                        Lưu
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setIsEditingSeverity(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-label-sm text-text-muted">
                Tạo lúc: {formatDateTime(report.createdAt)}
                {report.assignedTo && (
                  <span className="ml-3">
                    Phụ trách:{' '}
                    <strong className="text-text-primary">
                      {report.assignedTo.fullName}
                    </strong>
                  </span>
                )}
              </p>
            </div>

            {/* Reporter & Reported User Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reporter */}
              <div className={PANEL_CLASS}>
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-semibold text-text-muted uppercase">
                    Người báo cáo
                  </span>
                  <span className="text-label-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                    {report.reporter?.totalReportsSubmitted ?? 0} báo cáo đã gửi
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={report.reporter.avatarUrl}
                    alt={report.reporter.fullName}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-text-primary truncate">
                      {report.reporter.fullName}
                    </p>
                    <p className="text-body-xs text-text-muted truncate">
                      {report.reporter.email || '—'}
                    </p>
                    <p className="text-body-xs text-text-muted">
                      {report.reporter.phone || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reported User */}
              <div className={PANEL_CLASS}>
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-semibold text-text-muted uppercase">
                    Người bị báo cáo
                  </span>
                  <span
                    className={`text-label-xs px-2 py-0.5 rounded-full font-semibold ${
                      (report.reportedUser?.strikeCount || 0) > 0
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {report.reportedUser?.strikeCount ?? 0} vi phạm trước
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={report.reportedUser.avatarUrl}
                    alt={report.reportedUser.fullName}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary truncate">
                        {report.reportedUser.fullName}
                      </p>
                      <StatusChip
                        status={
                          report.reportedUser.isActive ? 'active' : 'locked'
                        }
                        label={
                          report.reportedUser.isActive ? 'Hoạt động' : 'Đã khóa'
                        }
                      />
                    </div>
                    <p className="text-body-xs text-text-muted truncate">
                      {report.reportedUser.email || '—'}
                    </p>
                    <p className="text-body-xs text-text-muted">
                      {report.reportedUser.phone || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-3">
              <h5 className={SECTION_TITLE_CLASS}>
                <Flag size={ICON_SIZE.SM} className="text-primary" /> Chi tiết
                vi phạm
              </h5>
              <div className={PANEL_CLASS}>
                <div className="flex items-center justify-between border-b border-hairline pb-2">
                  <span className="text-text-muted">Danh mục:</span>
                  <span className="font-semibold text-text-primary">
                    {REPORT_CATEGORY_LABELS[report.category] || report.category}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted text-label-sm">
                    Lý do báo cáo:
                  </span>
                  <p className="font-medium text-text-primary mt-0.5">
                    {report.reason || '—'}
                  </p>
                </div>
                {report.description && (
                  <div>
                    <span className="text-text-muted text-label-sm">
                      Mô tả chi tiết:
                    </span>
                    <p className="text-text-secondary mt-0.5 whitespace-pre-line bg-surface p-3 rounded-xl border border-hairline">
                      {report.description}
                    </p>
                  </div>
                )}

                {/* Evidence Gallery */}
                {report.evidenceUrls && report.evidenceUrls.length > 0 && (
                  <div className="pt-2 border-t border-hairline space-y-2">
                    <span className="text-text-muted text-label-sm">
                      Bằng chứng hình ảnh ({report.evidenceUrls.length}):
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {report.evidenceUrls.map((url, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setLightboxUrl(url)}
                          className="relative aspect-square rounded-xl overflow-hidden border border-hairline hover:opacity-90 group focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={ICON_SIZE.SM} className="text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Investigation Target Context */}
            {report.targetContext && (
              <div className="space-y-3">
                <h5 className={SECTION_TITLE_CLASS}>
                  {report.targetType === 'message' && (
                    <MessageSquare
                      size={ICON_SIZE.SM}
                      className="text-primary"
                    />
                  )}
                  {report.targetType === 'playdate' && (
                    <Calendar size={ICON_SIZE.SM} className="text-primary" />
                  )}
                  {report.targetType === 'user' && (
                    <User size={ICON_SIZE.SM} className="text-primary" />
                  )}
                  Ngữ cảnh đối tượng vi phạm
                </h5>

                {/* Message context */}
                {report.targetType === 'message' &&
                  report.targetContext.reportedMessage && (
                    <div className={PANEL_CLASS}>
                      <p className="text-label-sm text-text-muted mb-2">
                        Trích dẫn đoạn hội thoại xung quanh tin nhắn bị báo cáo:
                      </p>
                      <div className="space-y-2.5 max-h-80 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-hairline">
                        {report.targetContext.surroundingMessages?.map(
                          (msg) => {
                            const isViolated =
                              msg.id ===
                              report.targetContext.reportedMessage.id;
                            return (
                              <div
                                key={msg.id}
                                className={`p-3 rounded-xl border transition-colors ${
                                  isViolated
                                    ? 'bg-error-soft/40 border-error text-error-dark font-medium shadow-sm'
                                    : 'bg-surface border-hairline text-text-primary'
                                }`}
                              >
                                <div className="flex items-center justify-between text-label-xs mb-1">
                                  <span className="font-semibold">
                                    {msg.senderName}
                                  </span>
                                  <span className="text-text-muted">
                                    {formatDateTime(msg.createdAt)}
                                  </span>
                                </div>
                                <p className="text-body-sm">{msg.content}</p>
                                {msg.mediaUrl && (
                                  <img
                                    src={msg.mediaUrl}
                                    alt="Message media"
                                    className="mt-2 max-h-32 rounded-lg object-cover"
                                  />
                                )}
                                {isViolated && (
                                  <span className="inline-block mt-1 text-label-xs font-semibold text-error">
                                    ● Tin nhắn bị báo cáo
                                  </span>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                {/* Playdate context */}
                {report.targetType === 'playdate' && (
                  <div className={PANEL_CLASS}>
                    <p className="text-body-md font-semibold text-text-primary">
                      {report.targetContext.playdate?.activity ||
                        'Cuộc hẹn Playdate'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Địa điểm:{' '}
                      {report.targetContext.playdate?.location?.address || '—'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Thời gian:{' '}
                      {report.targetContext.playdate?.scheduledDate
                        ? formatDate(
                            report.targetContext.playdate.scheduledDate,
                          )
                        : '—'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Trạng thái:{' '}
                      {report.targetContext.playdate?.status ||
                        'Không tìm thấy cuộc hẹn'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Người tổ chức:{' '}
                      {report.targetContext.playdate?.host?.fullName ||
                        report.targetContext.playdate?.hostParent?.fullName ||
                        '—'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Người tham gia:{' '}
                      {report.targetContext.playdate?.participants?.length ?? 0}
                    </p>
                  </div>
                )}

                {/* User context */}
                {report.targetType === 'user' && (
                  <div className={PANEL_CLASS}>
                    <p className="text-body-md text-text-primary">
                      Hồ sơ phụ huynh có{' '}
                      <strong>{report.targetContext.childrenCount ?? 0}</strong>{' '}
                      hồ sơ bé đang hoạt động.
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Trạng thái tài khoản:{' '}
                      {report.reportedUser?.isActive
                        ? 'Đang hoạt động'
                        : 'Đang bị hạn chế'}
                    </p>
                    <p className="text-body-sm text-text-muted">
                      Số lần vi phạm: {report.reportedUser?.strikeCount ?? 0}
                    </p>
                  </div>
                )}
              </div>
            )}

            {report.reportedUser?.previousSanctions?.length > 0 && (
              <div className="space-y-3">
                <h5 className={SECTION_TITLE_CLASS}>
                  <History size={ICON_SIZE.SM} /> Lịch sử chế tài trước đây
                </h5>
                <div className={PANEL_CLASS}>
                  {report.reportedUser.previousSanctions.map(
                    (action, index) => (
                      <div
                        key={index}
                        className="border-b border-hairline last:border-0 pb-2 last:pb-0"
                      >
                        <p className="font-medium">
                          {REPORT_ACTION_LABELS[action.type] || action.type}
                        </p>
                        <p className="text-label-sm text-text-muted">
                          {formatDateTime(action.performedAt)} ·{' '}
                          {action.note || '—'}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Related Open Reports */}
            {report.relatedOpenReports &&
              report.relatedOpenReports.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className={SECTION_TITLE_CLASS}>
                      <AlertTriangle
                        size={ICON_SIZE.SM}
                        className="text-warning"
                      />{' '}
                      Báo cáo mở liên quan ({report.relatedOpenReports.length})
                    </h5>
                    <span className="text-label-xs text-text-muted">
                      Tích chọn để xử lý gộp
                    </span>
                  </div>
                  <div className={PANEL_CLASS}>
                    {report.relatedOpenReports.map((rel) => (
                      <label
                        key={rel.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-hairline hover:bg-surface cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedRelatedIds.includes(rel.id)}
                            onChange={() => toggleRelatedReport(rel.id)}
                            disabled={isClosed}
                            className="rounded border-hairline text-primary focus:ring-primary h-4 w-4"
                          />
                          <div>
                            <p className="text-body-sm font-medium text-text-primary">
                              {REPORT_CATEGORY_LABELS[rel.category] ||
                                rel.category}
                            </p>
                            <p className="text-label-xs text-text-muted">
                              Từ: {rel.reporterName} •{' '}
                              {formatDateTime(rel.createdAt)}
                            </p>
                          </div>
                        </div>
                        <StatusChip
                          status={
                            REPORT_SEVERITY_CONFIG[rel.severity]?.variant ||
                            'neutral'
                          }
                          label={
                            REPORT_SEVERITY_CONFIG[rel.severity]?.label ||
                            rel.severity
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

            {/* Disciplinary Action Bar */}
            {!isClosed && isReviewing && (
              <div className="space-y-3">
                <h5 className={SECTION_TITLE_CLASS}>
                  <ShieldAlert size={ICON_SIZE.SM} className="text-primary" />{' '}
                  Thi hành Chế tài Kỷ luật
                </h5>
                <div className={PANEL_CLASS}>
                  <p className="text-label-sm text-text-muted">
                    Các chế tài áp dụng trực tiếp lên đối tượng vi phạm. Mỗi
                    thao tác sẽ được ghi lại vào nhật ký kiểm duyệt:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        isActionLoading || appliedActionTypes.has('warn')
                      }
                      onClick={() => handleOpenActionConfirm('warn')}
                    >
                      {appliedActionTypes.has('warn')
                        ? '✓ Đã cảnh cáo'
                        : 'Cảnh cáo (Warn)'}
                    </Button>

                    {report.targetType === 'message' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-error border-error/30 hover:bg-error-soft/30"
                        disabled={
                          isActionLoading ||
                          appliedActionTypes.has('delete_message') ||
                          messageUnavailable
                        }
                        onClick={() =>
                          handleOpenActionConfirm('delete_message')
                        }
                      >
                        <Trash2 size={ICON_SIZE.XS} className="mr-1.5" />
                        {appliedActionTypes.has('delete_message')
                          ? '✓ Đã xóa tin nhắn'
                          : 'Xóa tin nhắn'}
                      </Button>
                    )}

                    {report.targetType === 'playdate' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-error border-error/30 hover:bg-error-soft/30"
                        disabled={
                          isActionLoading ||
                          appliedActionTypes.has('cancel_playdate') ||
                          playdateUnavailable
                        }
                        onClick={() =>
                          handleOpenActionConfirm('cancel_playdate')
                        }
                      >
                        <CalendarX size={ICON_SIZE.XS} className="mr-1.5" />
                        {appliedActionTypes.has('cancel_playdate')
                          ? '✓ Đã hủy playdate'
                          : 'Hủy cuộc hẹn'}
                      </Button>
                    )}

                    {/* Suspension Picker */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-800 border-amber-300 hover:bg-amber-50"
                        disabled={
                          isActionLoading || appliedActionTypes.has('suspend')
                        }
                        onClick={() => handleOpenActionConfirm('suspend', 3)}
                      >
                        Khóa 3 ngày
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-800 border-amber-300 hover:bg-amber-50"
                        disabled={
                          isActionLoading || appliedActionTypes.has('suspend')
                        }
                        onClick={() => handleOpenActionConfirm('suspend', 7)}
                      >
                        Khóa 7 ngày
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-800 border-amber-300 hover:bg-amber-50"
                        disabled={
                          isActionLoading || appliedActionTypes.has('suspend')
                        }
                        onClick={() => handleOpenActionConfirm('suspend', 30)}
                      >
                        Khóa 30 ngày
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="danger"
                      disabled={
                        isActionLoading || appliedActionTypes.has('ban')
                      }
                      onClick={() => handleOpenActionConfirm('ban')}
                    >
                      <Ban size={ICON_SIZE.XS} className="mr-1.5" />
                      {appliedActionTypes.has('ban')
                        ? '✓ Đã khóa vĩnh viễn'
                        : 'Khóa tài khoản vĩnh viễn'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {report.actions?.length > 0 && (
              <div className="space-y-3">
                <h5 className={SECTION_TITLE_CLASS}>
                  <ShieldAlert size={ICON_SIZE.SM} /> Hình phạt đã áp dụng
                </h5>
                <div className={PANEL_CLASS}>
                  {report.actions.map((action, index) => (
                    <div
                      key={index}
                      className="border-b border-hairline last:border-none pb-2 last:pb-0"
                    >
                      <p className="font-semibold">
                        {REPORT_ACTION_LABELS[action.type] || action.type}
                      </p>
                      <p className="text-label-sm text-text-muted">
                        {formatDateTime(action.performedAt)} ·{' '}
                        {action.performedBy?.fullName || 'Admin'}
                      </p>
                      {action.note && (
                        <p className="text-body-sm text-text-secondary">
                          {action.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit History Timeline */}
            {report.history && report.history.length > 0 && (
              <div className="space-y-3">
                <h5 className={SECTION_TITLE_CLASS}>
                  <History size={ICON_SIZE.SM} className="text-primary" /> Nhật
                  ký kiểm duyệt
                </h5>
                <div className={PANEL_CLASS}>
                  <div className="space-y-3">
                    {report.history.map((h, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-body-sm border-b border-hairline last:border-none pb-2.5 last:pb-0"
                      >
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between text-label-xs">
                            <span className="font-semibold text-text-primary">
                              {h.by?.fullName || 'Hệ thống'}
                            </span>
                            <span className="text-text-muted">
                              {formatDateTime(h.at)}
                            </span>
                          </div>
                          <p className="text-text-secondary mt-0.5">{h.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Form (When Reviewing or Pending) */}
            {!isClosed && isReviewing && (
              <form
                onSubmit={handleFormSubmit}
                className="space-y-3 border-t border-hairline pt-4"
              >
                <h5 className={SECTION_TITLE_CLASS}>
                  <CheckCircle2 size={ICON_SIZE.SM} className="text-primary" />{' '}
                  Kết luận & Đóng báo cáo
                </h5>
                <div className={PANEL_CLASS}>
                  {/* Status selection */}
                  <div>
                    <label className="text-label-sm text-text-muted block mb-1.5">
                      Kết luận vụ việc:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setResolutionStatus('resolved');
                          setResolutionType(
                            appliedActionTypes.size > 0
                              ? 'action_taken'
                              : 'no_action',
                          );
                        }}
                        className={`p-3 rounded-xl border text-center font-semibold text-body-md transition-all ${
                          resolutionStatus === 'resolved'
                            ? 'bg-primary-soft/30 border-primary text-primary-dark shadow-sm'
                            : 'bg-surface border-hairline text-text-muted'
                        }`}
                      >
                        Đã xử lý (Resolved)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResolutionStatus('dismissed');
                          setResolutionType('dismissed');
                        }}
                        className={`p-3 rounded-xl border text-center font-semibold text-body-md transition-all ${
                          resolutionStatus === 'dismissed'
                            ? 'bg-slate-200 border-slate-400 text-slate-800 shadow-sm'
                            : 'bg-surface border-hairline text-text-muted'
                        }`}
                      >
                        Bác bỏ (Dismissed)
                      </button>
                    </div>
                  </div>

                  {/* If resolved: action_taken or no_action */}
                  {resolutionStatus === 'resolved' && (
                    <div className="pt-2">
                      <label className="text-label-sm text-text-muted block mb-1">
                        Phương thức kết luận:
                      </label>
                      <div className="flex items-center gap-4 text-body-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="resolutionType"
                            value="action_taken"
                            checked={resolutionType === 'action_taken'}
                            onChange={(e) => setResolutionType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span>Đã áp dụng chế tài kỷ luật</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="resolutionType"
                            value="no_action"
                            checked={resolutionType === 'no_action'}
                            onChange={(e) => setResolutionType(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span>Không kỷ luật (Nhắc nhở / Không vi phạm)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-label-sm text-text-muted">
                        Ghi chú quản trị viên{' '}
                        <span className="text-error">*</span>
                      </label>
                      <span
                        className={`text-label-xs ${adminNotes.trim().length >= 10 ? 'text-text-muted' : 'text-error font-semibold'}`}
                      >
                        {adminNotes.trim().length} / tối thiểu 10 ký tự
                      </span>
                    </div>
                    <Textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => {
                        setAdminNotes(e.target.value);
                        if (formError) setFormError('');
                      }}
                      placeholder="Ghi rõ căn cứ xử lý hoặc lý do bác bỏ báo cáo này..."
                      className="w-full text-body-sm"
                    />
                    {formError && (
                      <p className="text-error text-label-sm mt-1">
                        {formError}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isActionLoading || adminNotes.trim().length < 10}
                    className="w-full mt-2"
                  >
                    Hoàn tất kiểm duyệt & Đóng báo cáo
                  </Button>
                </div>
              </form>
            )}

            {/* Closed Info */}
            {isClosed && (
              <div className={PANEL_CLASS}>
                <div className="flex items-center gap-2 font-semibold text-text-primary text-body-md">
                  <CheckCircle2 size={ICON_SIZE.SM} className="text-primary" />{' '}
                  Kết luận báo cáo ({report.status}):
                </div>
                <p className="text-body-sm text-text-secondary">
                  <strong>Kết quả:</strong>{' '}
                  {REPORT_RESOLUTION_LABELS[report.resolution] ||
                    report.resolution}
                </p>
                <p className="text-body-sm text-text-secondary">
                  <strong>Ghi chú:</strong> {report.adminNotes || '—'}
                </p>
                <p className="text-label-xs text-text-muted">
                  Đóng bởi: {report.resolvedBy?.fullName || 'Admin'} • lúc{' '}
                  {formatDateTime(report.resolvedAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reopen Modal */}
      <Modal open={isReopenOpen} onClose={() => setIsReopenOpen(false)}>
        <div className="p-6 space-y-4">
          <h4 className="text-title-md font-semibold text-text-primary flex items-center gap-2">
            <RotateCcw size={ICON_SIZE.MD} className="text-primary" /> Mở lại hồ
            sơ điều tra
          </h4>
          <p className="text-body-sm text-text-muted">
            Báo cáo sẽ chuyển lại về trạng thái <strong>Đang xem xét</strong>.
            Các chế tài đã thi hành trước đây sẽ không bị hủy tự động.
          </p>
          <div>
            <label className="text-label-sm text-text-muted block mb-1">
              Lý do mở lại vụ việc <span className="text-error">*</span>
            </label>
            <Textarea
              rows={3}
              value={reopenNote}
              onChange={(e) => {
                setReopenNote(e.target.value);
                if (reopenError) setReopenError('');
              }}
              placeholder="Nhập lý do hoặc tình tiết mới dẫn tới việc mở lại..."
            />
            {reopenError && (
              <p className="text-error text-label-sm mt-1">{reopenError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsReopenOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              disabled={isActionLoading || reopenNote.trim().length < 10}
              onClick={handleReopenSubmit}
            >
              Xác nhận mở lại
            </Button>
          </div>
        </div>
      </Modal>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxUrl}
              alt="Evidence Large"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-white text-black shadow-lg hover:bg-slate-100"
            >
              <XCircle size={ICON_SIZE.MD} />
            </button>
          </div>
        </div>
      )}

      {/* Disciplinary Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel="Xác nhận thi hành"
        cancelLabel="Hủy bỏ"
        isLoading={isActionLoading}
        reason={{
          required: false,
          label: 'Ghi chú thêm (không bắt buộc)',
          placeholder: 'Nhập ghi chú lý do kỷ luật...',
        }}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
      />
    </>
  );
};

export default AdminReportInvestigationDrawer;

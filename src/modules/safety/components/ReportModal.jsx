import React, { useRef } from 'react';
import {
  AlertTriangle,
  Upload,
  X,
  ShieldAlert,
  MessageSquareWarning,
  Ban,
  UserX,
  CalendarX,
  HelpCircle,
  Loader2,
  FileText,
  User,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { Modal } from '../../../components/feedback/Modal';
import { Button } from '../../../components/ui/Button';
import { Textarea } from '../../../components/ui/Textarea';
import { FilterChips } from '../../../components/search/FilterChips';
import { useReportForm } from '../hooks/useReportForm';
import {
  REPORT_TARGET_TYPES,
  REPORT_CATEGORIES,
  REPORT_CATEGORY_OPTIONS,
  REPORT_LIMITS,
  EVIDENCE_ACCEPT,
} from '../constants/safetyConstants';

// Icon map for category chips
const CATEGORY_ICONS = {
  [REPORT_CATEGORIES.HARASSMENT]: MessageSquareWarning,
  [REPORT_CATEGORIES.INAPPROPRIATE_CONTENT]: AlertTriangle,
  [REPORT_CATEGORIES.SPAM]: Ban,
  [REPORT_CATEGORIES.FAKE_PROFILE]: UserX,
  [REPORT_CATEGORIES.CHILD_SAFETY]: ShieldAlert,
  [REPORT_CATEGORIES.NO_SHOW]: CalendarX,
  [REPORT_CATEGORIES.OTHER]: HelpCircle,
};

const CATEGORY_CHIPS = REPORT_CATEGORY_OPTIONS.map((cat) => ({
  id: cat.value,
  label: cat.label,
  icon: CATEGORY_ICONS[cat.value],
}));

/**
 * ReportModal - Reusable modal to report inappropriate users, offensive messages,
 * or problematic playdates. The form lives in useReportForm.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} [props.target] - { reportedUserId, targetType, targetMessageId, targetPlaydateId, targetName, targetSummary }
 * @param {Function} [props.onSubmitSuccess] - Callback fired on successful report
 */
export const ReportModal = ({ isOpen, onClose, target, onSubmitSuccess }) => {
  const fileInputRef = useRef(null);
  const targetType = target?.targetType || REPORT_TARGET_TYPES.USER;
  const targetName = target?.targetName || 'Người dùng';
  const targetSummary = target?.targetSummary || null;

  const {
    category,
    selectedOption,
    description,
    evidenceUrls,
    isUploading,
    isSubmitting,
    isBusy,
    canAddEvidence,
    selectCategory,
    changeDescription,
    addEvidence,
    removeEvidence,
    submit,
  } = useReportForm({
    target,
    isOpen,
    onSubmitted: () => {
      onClose();
      onSubmitSuccess?.();
    },
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    addEvidence(files);
  };

  // Target type icon & label
  const renderTargetHeader = () => {
    if (targetType === REPORT_TARGET_TYPES.MESSAGE) {
      return (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-hairline text-xs mb-4">
          <MessageSquare className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-text-primary">Tin nhắn từ {targetName}:</span>
            {targetSummary && (
              <p className="text-text-muted italic truncate mt-0.5">&ldquo;{targetSummary}&rdquo;</p>
            )}
          </div>
        </div>
      );
    }

    if (targetType === REPORT_TARGET_TYPES.PLAYDATE) {
      return (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-container-low border border-hairline text-xs mb-4">
          <Calendar className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-text-primary">Buổi hẹn Playdate:</span>
            <p className="text-text-muted truncate mt-0.5">{targetSummary || targetName}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-container-low border border-hairline text-xs mb-4">
        <User className="w-4 h-4 text-text-muted shrink-0" />
        <span className="text-text-muted">Đang báo cáo phụ huynh:</span>
        <span className="font-bold text-text-primary truncate">{targetName}</span>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isBusy && onClose()}
      title="Báo cáo vi phạm"
      maxWidth="max-w-lg"
      className="bg-white"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isBusy}
            className="border border-hairline text-text-muted hover:text-text-primary"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={submit}
            disabled={!category || isBusy}
            isLoading={isSubmitting}
            className="font-semibold"
          >
            Gửi báo cáo
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Context Card */}
        {renderTargetHeader()}

        {/* 1. Category Chips */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1.5">
            Lý do vi phạm <span className="text-error">*</span>
          </label>
          <p className="text-xs text-text-muted mb-2.5">
            Chọn một danh mục phù hợp nhất với hành vi vi phạm:
          </p>
          <FilterChips
            options={CATEGORY_CHIPS}
            selected={category}
            onChange={selectCategory}
            className="flex-wrap overflow-visible"
          />

          {/* Category description explanation */}
          {selectedOption && (
            <p className="mt-2 text-xs text-primary font-medium bg-primary-soft/40 px-3 py-1.5 rounded-lg border border-primary-border/60">
              {selectedOption.description}
            </p>
          )}
        </div>

        {/* 2. Detailed Description */}
        <div>
          <label htmlFor="report-description" className="block text-sm font-semibold text-text-primary mb-1">
            Mô tả chi tiết
          </label>
          <Textarea
            id="report-description"
            rows={3}
            placeholder="Cung cấp thêm chi tiết về tình huống vi phạm để ban quản trị xử lý chính xác..."
            maxLength={REPORT_LIMITS.MAX_DESCRIPTION_LENGTH}
            value={description}
            onChange={(e) => changeDescription(e.target.value)}
            disabled={isSubmitting}
            className="text-xs sm:text-sm resize-none"
          />
          <div className="flex justify-between items-center mt-1 text-xs text-text-muted">
            <span>Không chia sẻ mật khẩu hoặc thông tin thanh toán nhạy cảm.</span>
            <span>
              {description.length}/{REPORT_LIMITS.MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* 3. Evidence Image Uploads */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-text-primary">
              Hình ảnh bằng chứng (tối đa {REPORT_LIMITS.MAX_EVIDENCE_URLS})
            </label>
            <span className="text-xs text-text-muted">
              {evidenceUrls.length}/{REPORT_LIMITS.MAX_EVIDENCE_URLS}
            </span>
          </div>

          {/* Upload Button */}
          {canAddEvidence && (
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={EVIDENCE_ACCEPT}
                multiple
                className="hidden"
                id="report-evidence-upload"
                onChange={handleFileChange}
                disabled={isBusy}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-3 rounded-xl hover:border-primary text-text-muted hover:text-primary transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Đang tải ảnh lên máy chủ BuddyLink...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh chụp màn hình bằng chứng (PNG, JPG, WebP, GIF)</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Evidence Previews */}
          {evidenceUrls.length > 0 && (
            <div className="grid grid-cols-5 gap-2 pt-1">
              {evidenceUrls.map((url, index) => (
                <div
                  key={url}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-hairline bg-surface-container-low shadow-2xs"
                >
                  <img
                    src={url}
                    alt={`Bằng chứng ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeEvidence(index)}
                    aria-label={`Xóa ảnh ${index + 1}`}
                    disabled={isSubmitting}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 opacity-90 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Safe notice */}
        <div className="p-3 bg-tertiary-fixed/30 border border-tertiary-fixed rounded-xl flex items-start gap-2 text-xs text-text-primary">
          <FileText className="w-4 h-4 text-tertiary-dark shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Báo cáo của bạn được giữ bảo mật. Người bị báo cáo sẽ <strong>không</strong> biết ai đã gửi báo cáo. Ban quản trị BuddyLink sẽ xem xét trong vòng 24h.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ReportModal;

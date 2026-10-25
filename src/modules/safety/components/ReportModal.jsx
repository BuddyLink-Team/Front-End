import React, { useState, useEffect, useRef } from 'react';
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
import { useToast } from '../../../hooks/useToast';
import { useSafetyActions } from '../hooks/useSafetyActions';
import { safetyApi } from '../api/safetyApi';
import {
  REPORT_TARGET_TYPES,
  REPORT_CATEGORIES,
  REPORT_CATEGORY_OPTIONS,
  REPORT_LIMITS,
} from '../constants/safetyConstants';
import { cn } from '../../../utils/cn';

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

/**
 * ReportModal - Reusable modal to report inappropriate users, offensive messages,
 * or problematic playdates.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Object} [props.target] - Target payload: { reportedUserId, targetType, targetMessageId, targetPlaydateId, targetName, targetSummary }
 * @param {string} [props.reportedUserId] - Directly supplied reported parent ID
 * @param {string} [props.targetType] - 'user' | 'message' | 'playdate' (default: 'user')
 * @param {string} [props.targetMessageId] - Message ObjectId if reporting a message
 * @param {string} [props.targetPlaydateId] - Playdate ObjectId if reporting a playdate
 * @param {string} [props.targetName] - Display name of target user
 * @param {string} [props.targetSummary] - Text snippet or playdate title for context
 * @param {Function} [props.onSubmitSuccess] - Callback fired on successful report
 */
export const ReportModal = ({
  isOpen,
  onClose,
  target,
  reportedUserId: propReportedUserId,
  targetType: propTargetType,
  targetMessageId: propTargetMessageId,
  targetPlaydateId: propTargetPlaydateId,
  targetName: propTargetName,
  targetSummary: propTargetSummary,
  onSubmitSuccess,
}) => {
  const toast = useToast();
  const { reportUser, isSubmitting } = useSafetyActions();
  const fileInputRef = useRef(null);

  // Extract target fields from prop or target object
  const reportedUserId = target?.reportedUserId || propReportedUserId;
  const targetType = target?.targetType || propTargetType || REPORT_TARGET_TYPES.USER;
  const targetMessageId = target?.targetMessageId || propTargetMessageId || null;
  const targetPlaydateId = target?.targetPlaydateId || propTargetPlaydateId || null;
  const targetName = target?.targetName || propTargetName || 'Người dùng';
  const targetSummary = target?.targetSummary || propTargetSummary || null;

  // Local state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory('');
      setDescription('');
      setEvidenceUrls([]);
      setIsUploadingImage(false);
    }
  }, [isOpen]);

  // Handle uploading evidence image
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (evidenceUrls.length + files.length > REPORT_LIMITS.MAX_EVIDENCE_URLS) {
      toast.error(`Chỉ được tải lên tối đa ${REPORT_LIMITS.MAX_EVIDENCE_URLS} hình ảnh bằng chứng.`);
      e.target.value = '';
      return;
    }

    setIsUploadingImage(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`Tệp ${file.name} không phải là hình ảnh hợp lệ.`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`Ảnh ${file.name} vượt quá dung lượng tối đa 5MB.`);
          continue;
        }

        const response = await safetyApi.uploadEvidence(file);
        const imageUrl = response?.data?.url || response?.url;
        if (imageUrl) {
          setEvidenceUrls((prev) => {
            if (prev.length < REPORT_LIMITS.MAX_EVIDENCE_URLS) {
              return [...prev, imageUrl];
            }
            return prev;
          });
        }
      }
    } catch {
      toast.error('Tải ảnh bằng chứng thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove evidence image
  const handleRemoveImage = (indexToRemove) => {
    setEvidenceUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Handle submit report
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!reportedUserId) {
      toast.error('Không tìm thấy thông tin đối phương để báo cáo.');
      return;
    }

    if (!selectedCategory) {
      toast.error('Vui lòng chọn danh mục vi phạm.');
      return;
    }

    const categoryObj = REPORT_CATEGORY_OPTIONS.find((c) => c.value === selectedCategory);
    const reasonText = categoryObj?.label || selectedCategory;

    const payload = {
      reportedUserId,
      targetType,
      targetMessageId: targetType === REPORT_TARGET_TYPES.MESSAGE ? targetMessageId : null,
      targetPlaydateId: targetType === REPORT_TARGET_TYPES.PLAYDATE ? targetPlaydateId : null,
      category: selectedCategory,
      reason: reasonText,
      description: description.trim(),
      evidenceUrls,
    };

    const result = await reportUser(payload);
    if (result.success) {
      onClose();
      onSubmitSuccess?.();
    }
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

  const selectedCategoryObj = REPORT_CATEGORY_OPTIONS.find((c) => c.value === selectedCategory);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && !isUploadingImage && onClose()}
      title="Báo cáo vi phạm"
      maxWidth="max-w-lg"
      className="bg-white"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting || isUploadingImage}
            className="border border-hairline text-text-muted hover:text-text-primary"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleSubmit}
            disabled={!selectedCategory || isSubmitting || isUploadingImage}
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
          <div className="flex flex-wrap gap-2">
            {REPORT_CATEGORY_OPTIONS.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.value] || AlertTriangle;
              const isSelected = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border outline-none',
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                      : 'bg-surface-container-low text-text-primary border-hairline hover:border-primary/40 hover:bg-surface-container',
                  )}
                >
                  <IconComponent className={cn('w-3.5 h-3.5', isSelected ? 'text-white' : 'text-text-muted')} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category description explanation */}
          {selectedCategoryObj && (
            <p className="mt-2 text-xs text-primary font-medium bg-primary-soft/40 px-3 py-1.5 rounded-lg border border-primary-border/60">
              {selectedCategoryObj.description}
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
            onChange={(e) => setDescription(e.target.value)}
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
          {evidenceUrls.length < REPORT_LIMITS.MAX_EVIDENCE_URLS && (
            <div className="mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                multiple
                className="hidden"
                id="report-evidence-upload"
                onChange={handleFileChange}
                disabled={isSubmitting || isUploadingImage}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || isUploadingImage}
                className="w-full flex items-center justify-center gap-2 border-dashed border-2 py-3 rounded-xl hover:border-primary text-text-muted hover:text-primary transition-colors"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span>Đang tải ảnh lên máy chủ BuddyLink...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Tải ảnh chụp màn hình bằng chứng (PNG, JPG, WebP)</span>
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
                  key={index}
                  className="relative group aspect-square rounded-xl overflow-hidden border border-hairline bg-surface-container-low shadow-2xs"
                >
                  <img
                    src={url}
                    alt={`Bằng chứng ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
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

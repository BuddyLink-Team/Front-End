import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  Heart,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Crown,
} from 'lucide-react';
import {
  Card,
  Button,
  Spinner,
  ConfirmDialog,
  Modal,
  UpgradeButton,
  FormPageHeader,
  FormSection,
} from '../../../components';
import { ChildBasicInfoStep, ChildInterestsStep } from '../components';
import { useChildForm } from '../hooks/useChildForm';

export const ChildFormPage = () => {
  const navigate = useNavigate();
  const {
    isEditMode,
    formData,
    formErrors,
    isLoading,
    isDeleting,
    isFetchingChild,
    quotaExceededError,
    setQuotaExceededError,
    updateField,
    toggleArrayItem,
    handleSubmit,
    handleDeleteChild,
    onCancel,
  } = useChildForm();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isFetchingChild) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-text-muted">
          Đang tải thông tin hồ sơ của bé...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-16 space-y-6">
      <FormPageHeader
        title={isEditMode ? `Chỉnh sửa hồ sơ · ${formData.displayName || 'bé'}` : 'Thêm hồ sơ bé'}
        description={
          isEditMode
            ? 'Cập nhật thông tin để BuddyLink gợi ý bạn chơi chính xác hơn cho con.'
            : 'Giới thiệu về con để BuddyLink tìm những người bạn chơi phù hợp nhất.'
        }
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} noValidate>
        <Card padding="lg" className="animate-fadeIn">
          <FormSection
            title="Thông tin cơ bản"
            description="Tên gọi, ngày sinh và giới tính của bé."
            icon={Baby}
          >
            <ChildBasicInfoStep
              formData={formData}
              formErrors={formErrors}
              updateField={updateField}
              showPrivacyNote={false}
            />
          </FormSection>

          <FormSection
            title="Sở thích & tính cách"
            description="Chọn ít nhất 1 mục ở mỗi nhóm để gợi ý bạn chơi chính xác hơn."
            icon={Heart}
          >
            <ChildInterestsStep
              formData={formData}
              formErrors={formErrors}
              toggleArrayItem={toggleArrayItem}
            />
          </FormSection>
        </Card>

        {/* Form Actions Footer (sticks to the bottom of the screen on mobile) */}
        <div className="sticky bottom-0 z-10 -mx-6 sm:mx-0 mt-6 px-6 sm:px-0 py-3 sm:py-0 bg-surface/95 sm:bg-transparent backdrop-blur sm:backdrop-blur-none border-t border-hairline sm:border-0 sm:static flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <p className="hidden sm:flex items-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            Thông tin của con chỉ hiển thị với phụ huynh đã xác thực danh tính.
          </p>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} className="flex-1 sm:flex-none">
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1 sm:flex-none px-6 font-semibold shadow-md"
            >
              {isEditMode ? 'Lưu thay đổi' : 'Tạo hồ sơ bé'}
            </Button>
          </div>
        </div>
      </form>

      {/* Danger Zone: delete is kept away from the main actions */}
      {isEditMode && (
        <Card className="border-error/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-error">Xóa hồ sơ bé</p>
            <p className="text-xs text-text-muted mt-0.5">
              Hồ sơ của bé sẽ bị gỡ khỏi hệ thống và không thể khôi phục.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            className="text-error border-error/40 hover:bg-error/10 shrink-0"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Xóa hồ sơ
          </Button>
        </Card>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDeleteModal}
        title="Xóa hồ sơ bé"
        description={`Bạn có chắc chắn muốn xóa hồ sơ của bé "${formData.displayName || 'này'}" không? Hành động này sẽ gỡ bỏ thông tin của bé khỏi hệ thống.`}
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteChild}
        onCancel={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
          }
        }}
      />

      {/* Quota Exceeded Modal */}
      <Modal
        isOpen={Boolean(quotaExceededError)}
        onClose={() => setQuotaExceededError(null)}
        title="Đã đạt giới hạn hồ sơ bé"
        maxWidth="max-w-md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setQuotaExceededError(null)}>
              Để sau
            </Button>
            <UpgradeButton
              onClick={() => {
                setQuotaExceededError(null);
                navigate('/subscription');
              }}
            >
              Nâng cấp Premium ngay
            </UpgradeButton>
          </>
        }
      >
        <div className="space-y-5 py-2">
          <div className="w-14 h-14 rounded-2xl bg-tertiary/15 text-tertiary-dark flex items-center justify-center mx-auto">
            <Crown className="w-7 h-7" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-base font-bold text-on-surface">
              Nâng cấp gói Premium để tạo thêm hồ sơ bé
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              {quotaExceededError ||
                'Gói hiện tại chỉ cho phép quản lý tối đa 1 hồ sơ bé. Nâng cấp lên gói Premium để quản lý không giới hạn con và mở khóa đầy đủ tính năng kết nối!'}
            </p>
          </div>

          <div className="bg-surface-container rounded-2xl p-4 space-y-2 text-xs text-text-muted">
            <div className="flex items-center gap-2 text-on-surface font-semibold">
              <Sparkles className="w-4 h-4 text-tertiary-container" />
              <span>Đặc quyền gói Premium:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Quản lý không giới hạn số lượng hồ sơ con</li>
              <li>Không giới hạn lượt khám phá & gửi yêu cầu kết nối</li>
              <li>Tạo và tham gia các buổi Playdate không giới hạn</li>
              <li>Hỏi đáp không giới hạn với Trợ lý AI</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChildFormPage;

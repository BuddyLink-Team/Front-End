import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Baby,
  ArrowLeft,
  Save,
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
    <Card className="w-full py-4 space-y-6">
      {/* Header Badge & Title */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1.5 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isEditMode ? 'Chỉnh sửa hồ sơ bé' : 'Thêm hồ sơ bé mới'}
            </span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight font-display mb-1.5">
          {isEditMode
            ? `Hồ sơ bé ${formData.displayName || ''}`
            : 'Hồ sơ & Sở thích của bé'}
        </h1>
        <p className="text-sm text-text-muted">
          {isEditMode
            ? 'Cập nhật lại tên gọi, ngày sinh, sở thích và tính cách của con để luôn có những gợi ý bạn chơi chính xác nhất.'
            : 'Giới thiệu thông tin, sở thích và tính cách để BuddyLink tìm bạn phù hợp nhất với con.'}
        </p>
      </div>

      {/* Form Form Body (Reusing ChildBasicInfoStep and ChildInterestsStep) */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8 animate-fadeIn"
        noValidate
      >
        {/* Section 1: Child Basic Info */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-on-surface">
            <Baby className="w-4 h-4 text-primary" />
            <span>Thông tin cơ bản</span>
          </div>
          <ChildBasicInfoStep
            formData={formData}
            formErrors={formErrors}
            updateField={updateField}
          />
        </div>

        {/* Section 2: Interests & Personality */}
        <div className="border-t border-hairline pt-6">
          <ChildInterestsStep
            formData={formData}
            formErrors={formErrors}
            toggleArrayItem={toggleArrayItem}
          />
        </div>

        {/* Form Actions Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-hairline">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Hủy
            </Button>

            {isEditMode && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="text-error hover:bg-error/10 text-sm font-semibold"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Xóa hồ sơ bé
              </Button>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            rightIcon={<Save className="w-4 h-4" />}
            className="px-6 py-3 font-semibold shadow-md"
          >
            {isEditMode ? 'Lưu thay đổi' : 'Tạo hồ sơ bé'}
          </Button>
        </div>
      </form>

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

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuotaExceededError(null)}
            >
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
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default ChildFormPage;

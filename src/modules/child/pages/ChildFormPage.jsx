import React, { useState } from 'react';
import {
  Baby,
  ArrowLeft,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Card,
  Button,
  Spinner,
  ConfirmDialog,
} from '../../../components';
import { ChildBasicInfoStep, ChildInterestsStep } from '../components';
import { useChildForm } from '../hooks/useChildForm';

export const ChildFormPage = () => {
  const {
    isEditMode,
    formData,
    formErrors,
    isLoading,
    isDeleting,
    isFetchingChild,
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
    </Card>
  );
};

export default ChildFormPage;

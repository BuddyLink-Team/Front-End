import React from 'react';
import { Modal, PasswordInput, Button } from '../../../components';
import { useChangePassword } from '../hooks/useParentTabHooks';

export const ChangePasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { register, handleSubmit, errors } = useChangePassword({
    onSubmit,
    onClose,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đổi mật khẩu tài khoản"
      maxWidth="max-w-md"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" form="change-password-form" isLoading={isSubmitting}>
            Lưu mật khẩu mới
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <p className="text-xs text-text-muted">
          Vui lòng nhập mật khẩu hiện tại và tạo mật khẩu mới an toàn
        </p>

        {/* Form */}
        <form id="change-password-form" className="space-y-4" onSubmit={handleSubmit} noValidate>
          <PasswordInput
            id="modal-currentPassword"
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu đang dùng"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <PasswordInput
            id="modal-newPassword"
            label="Mật khẩu mới"
            placeholder="Tối thiểu 6 ký tự"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <PasswordInput
            id="modal-confirmNewPassword"
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            error={errors.confirmNewPassword?.message}
            {...register('confirmNewPassword')}
          />

        </form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;

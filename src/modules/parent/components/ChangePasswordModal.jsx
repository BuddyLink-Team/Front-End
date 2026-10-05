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
    >
      <div className="space-y-5">
        <p className="text-xs text-text-muted">
          Vui lòng nhập mật khẩu hiện tại và tạo mật khẩu mới an toàn
        </p>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline/60">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md"
              isLoading={isSubmitting}
            >
              Lưu mật khẩu mới
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;

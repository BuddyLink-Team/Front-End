import React from 'react';
import { AlertTriangle, Trash2, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from './Modal';

/**
 * ConfirmDialog – confirmation modal for dangerous/critical operations.
 *
 * @param {boolean} open
 * @param {string} [title='Xác nhận thao tác']
 * @param {string} [description='Thao tác này có thể ảnh hưởng đến dữ liệu hiện có.']
 * @param {string} [confirmLabel='Xác nhận']
 * @param {string} [cancelLabel='Hủy']
 * @param {'danger'|'warning'|'info'} [variant='danger']
 * @param {Function} onConfirm
 * @param {Function} onCancel
 * @param {boolean} [isLoading=false]
 */
export const ConfirmDialog = ({
  open = false,
  title = 'Xác nhận thao tác',
  description = 'Thao tác này có thể ảnh hưởng đến dữ liệu hiện có.',
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!open) return null;

  const variantConfig = {
    danger: {
      icon: Trash2,
      iconColor: 'text-error',
      bg: 'bg-error-container/60',
      btnVariant: 'danger',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-tertiary-dark',
      bg: 'bg-tertiary-fixed/50',
      btnVariant: 'primary',
    },
    info: {
      icon: Info,
      iconColor: 'text-primary-dark',
      bg: 'bg-primary-fixed/40',
      btnVariant: 'primary',
    },
  };

  const current = variantConfig[variant] || variantConfig.danger;
  const Icon = current.icon;

  return (
    <Modal
      isOpen
      onClose={() => !isLoading && onCancel?.()}
      maxWidth="max-w-sm"
      className="bg-white"
      bodyClassName="p-6 text-center"
    >
      <div
        className={`w-14 h-14 ${current.bg} ${current.iconColor} rounded-2xl flex items-center justify-center mb-4 mx-auto`}
      >
        <Icon className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 border border-hairline"
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={current.btnVariant}
          onClick={onConfirm}
          isLoading={isLoading}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;

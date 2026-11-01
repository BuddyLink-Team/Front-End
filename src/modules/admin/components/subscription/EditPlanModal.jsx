import React from 'react';
import { Controller } from 'react-hook-form';
import { Sliders, AlertTriangle, Check } from 'lucide-react';
import { Modal } from '../../../../components/feedback/Modal';
import { ConfirmDialog } from '../../../../components/feedback/ConfirmDialog';
import { Skeleton } from '../../../../components/feedback/Skeleton';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { RequiredMark } from '../../../../components/form/RequiredMark';
import { Switch } from '../../../../components/ui/Switch';
import { useEditPlanForm } from '../../hooks/useEditPlanForm';
import { PLAN_BILLING_CYCLE_LABELS, PLAN_FEATURE_FIELDS } from '../../constants/admin.constants';
import { formatCurrency } from '../../../../utils/formatters';
import { cn } from '../../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../../constants/icon.constants';

const FORM_ID = 'edit-plan-form';
const LABEL_CLASS = 'block text-xs font-semibold text-on-surface mb-1';

/**
 * Edit a plan: name, limits and, for a Premium plan, price and on-sale state.
 * The plan is fetched again each time the modal opens.
 *
 * @param {Object} plan - Plan of the list
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {(id: string, payload: Object) => Promise<boolean>} onSave - true when saved
 * @param {boolean} [isUpdating]
 */
export const EditPlanModal = ({ plan: listPlan, isOpen, onClose, onSave, isUpdating }) => {
  const {
    plan,
    isLoading,
    loadError,
    register,
    control,
    submit,
    isDirty,
    isActive,
    errorOf,
    isUnlimited,
    toggleUnlimited,
    pendingPayload,
    confirmPriceChange,
    cancelPriceChange,
  } = useEditPlanForm(listPlan, isOpen, onSave, onClose);
  const isFree = plan.isFree;
  const isBusy = isUpdating || isLoading;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={
          // Rendered inside the modal's <h3>: inline elements only
          <span className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary-dark">
              <Sliders size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.DEFAULT} />
            </span>
            <span>
              <span className="block text-base font-semibold text-on-surface">Chỉnh sửa Gói dịch vụ</span>
              <span className="block text-xs font-normal text-on-surface-variant font-mono">planCode: {plan.planCode}</span>
            </span>
          </span>
        }
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating} className="rounded-full px-5 text-xs">
              Hủy
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              isLoading={isUpdating}
              disabled={isBusy || Boolean(loadError) || !isDirty}
              leftIcon={<Check size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.DEFAULT} />}
              className="rounded-full px-6 text-xs"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : loadError ? (
          <p className="py-8 text-center text-xs text-error">{loadError}</p>
        ) : (
          <form id={FORM_ID} onSubmit={submit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="plan-name" className={LABEL_CLASS}>
                Tên gói dịch vụ
                <RequiredMark />
              </label>
              <Input id="plan-name" error={errorOf('name')} disabled={isUpdating} {...register('name')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="plan-price" className={LABEL_CLASS}>
                  Giá tiền (VNĐ)
                  {!isFree && <RequiredMark />}
                </label>
                <Input
                  id="plan-price"
                  type="number"
                  min={isFree ? 0 : 1}
                  disabled={isFree || isUpdating}
                  error={errorOf('price')}
                  {...register('price')}
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  {isFree ? 'Gói Free luôn có giá 0 đ' : 'Giá gói Premium phải lớn hơn 0 đ'}
                </p>
              </div>
              <div>
                <label htmlFor="plan-cycle" className={LABEL_CLASS}>
                  Chu kỳ thanh toán
                </label>
                <Input
                  id="plan-cycle"
                  value={PLAN_BILLING_CYCLE_LABELS[plan.billingCycle] || plan.billingCycle}
                  disabled
                  readOnly
                  className="bg-surface-muted cursor-not-allowed"
                />
              </div>
            </div>

            {/* Quota Limits */}
            <div>
              <p className="block text-xs font-semibold text-on-surface mb-2">Hạn mức &amp; Đặc quyền (Quotas):</p>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {PLAN_FEATURE_FIELDS.map(({ key, label, fallback }) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-hairline flex items-center justify-between gap-2"
                  >
                    <label htmlFor={`plan-feature-${key}`} className="text-xs font-medium text-on-surface flex-1">
                      {label}
                      {!isUnlimited(key) && <RequiredMark />}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                        <Switch
                          size="sm"
                          aria-label={`${label}: vô cực`}
                          checked={isUnlimited(key)}
                          disabled={isUpdating}
                          onChange={() => toggleUnlimited(key, fallback)}
                        />
                        <span>Vô cực</span>
                      </span>
                      {!isUnlimited(key) && (
                        <input
                          id={`plan-feature-${key}`}
                          type="number"
                          min="0"
                          disabled={isUpdating}
                          className={cn(
                            'w-14 px-2 py-0.5 text-xs text-right border rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary',
                            errorOf(`features.${key}`) ? 'border-error' : 'border-hairline'
                          )}
                          {...register(`features.${key}`)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* On-sale state */}
            <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-on-surface">Trạng thái kích hoạt gói</div>
                <div className="text-xs text-on-surface-variant">
                  {isFree || isActive ? 'Cho phép phụ huynh đăng ký gói này' : 'Tạm ngưng hiển thị gói'}
                </div>
              </div>
              {isFree ? (
                <Switch size="md" checked disabled />
              ) : (
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch size="md" checked={field.value} disabled={isUpdating} onChange={field.onChange} />
                  )}
                />
              )}
            </div>

            {isFree && (
              <div className="p-2.5 rounded-xl bg-surface-container text-on-surface-variant text-xs flex items-center gap-2">
                <AlertTriangle size={ICON_SIZE.MD} strokeWidth={ICON_STROKE.DEFAULT} className="text-primary shrink-0" />
                <span>Gói Free mặc định của hệ thống không thể bị tắt hoặc sửa giá.</span>
              </div>
            )}
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingPayload)}
        title="Xác nhận thay đổi giá gói cước"
        description={`Bạn có chắc chắn muốn thay đổi giá gói ${plan.name} từ ${formatCurrency(plan.price)} thành ${formatCurrency(
          pendingPayload?.price
        )}? Thay đổi này sẽ áp dụng cho tất cả các lượt đăng ký mới. Thuê bao hiện tại không bị ảnh hưởng.`}
        confirmLabel="Đồng ý đổi giá"
        cancelLabel="Quay lại"
        variant="warning"
        isLoading={isUpdating}
        onConfirm={confirmPriceChange}
        onCancel={cancelPriceChange}
      />
    </>
  );
};

export default EditPlanModal;

import React, { useState, useEffect } from 'react';
import { X, Sliders, AlertTriangle, Check } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Switch } from '../../../../components/ui/Switch';
import { ConfirmDialog } from '../../../../components/feedback/ConfirmDialog';

const QUOTA_FIELDS = [
  { key: 'childProfilesLimit', label: 'Hồ sơ trẻ tối đa', fallback: 1 },
  { key: 'discoveryViewLimitPerDay', label: 'Lượt quẹt hồ sơ / ngày', fallback: 5 },
  { key: 'connectionRequestsLimitPerMonth', label: 'Yêu cầu kết bạn / tháng', fallback: 5 },
  { key: 'playdatesLimitPerMonth', label: 'Cuộc hẹn tạo / tháng', fallback: 3 },
  { key: 'playdateParticipationLimitPerMonth', label: 'Cuộc hẹn tham gia / tháng', fallback: 3 },
  { key: 'aiAssistantLimitPerMonth', label: 'Yêu cầu Trợ lý AI / tháng', fallback: 5 },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

export const EditPlanModal = ({ plan, isOpen, onClose, onSave, isUpdating }) => {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    price: plan?.price || 0,
    isActive: plan?.isActive ?? true,
    features: { ...(plan?.features || {}) },
  });

  const [showConfirmPrice, setShowConfirmPrice] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        price: plan.price || 0,
        isActive: plan.isActive ?? true,
        features: { ...(plan.features || {}) },
      });
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const isFree = plan.planCode === 'free';

  const handleFeatureToggleUnlimited = (key, fallbackValue) => {
    setFormData((prev) => {
      const currentVal = prev.features[key];
      const isUnlimited = currentVal === -1;
      return {
        ...prev,
        features: {
          ...prev.features,
          [key]: isUnlimited ? fallbackValue : -1,
        },
      };
    });
  };

  const handleFeatureValueChange = (key, value) => {
    const num = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: isNaN(num) ? 0 : Math.max(0, num),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFree && formData.price !== plan.price) {
      setShowConfirmPrice(true);
      return;
    }
    submitUpdate();
  };

  const submitUpdate = () => {
    setShowConfirmPrice(false);
    onSave(plan.id, formData);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-soft flex items-center justify-center text-primary-dark">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Chỉnh sửa Gói dịch vụ</h3>
                <p className="text-xs text-on-surface-variant font-mono">planCode: {plan.planCode}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Tên gói dịch vụ
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                disabled={isUpdating}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Giá tiền (VNĐ)
                </label>
                <Input
                  type="number"
                  min={isFree ? 0 : 1}
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  disabled={isFree || isUpdating}
                  required
                />
                <p className="text-xs text-on-surface-variant mt-1">
                  {isFree ? 'Gói Free luôn có giá 0 đ' : 'Không được đặt giá âm (< 0 đ)'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Chu kỳ thanh toán
                </label>
                <Input
                  value={
                    plan.billingCycle === 'monthly'
                      ? 'Hàng tháng (30 ngày)'
                      : plan.billingCycle === 'yearly'
                      ? 'Hàng năm (365 ngày)'
                      : 'Vô thời hạn'
                  }
                  disabled
                  className="bg-surface-container/50 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Quota Limits */}
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-2">
                Hạn mức &amp; Đặc quyền (Quotas):
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {QUOTA_FIELDS.map(({ key, label, fallback }) => {
                  const currentValue = formData.features[key] ?? fallback;
                  const isUnlimited = currentValue === -1;

                  return (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-surface-container-low border border-hairline flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-medium text-on-surface flex-1">{label}</span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-on-surface-variant">
                          <Switch
                            size="sm"
                            checked={isUnlimited}
                            disabled={isUpdating}
                            onChange={() => handleFeatureToggleUnlimited(key, fallback)}
                          />
                          <span>Vô cực</span>
                        </label>
                        {!isUnlimited && (
                          <input
                            type="number"
                            min="0"
                            value={currentValue}
                            disabled={isUpdating}
                            onChange={(e) => handleFeatureValueChange(key, e.target.value)}
                            className="w-14 px-2 py-0.5 text-xs text-right border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trạng thái kích hoạt gói */}
            <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-on-surface">Trạng thái kích hoạt gói</div>
                <div className="text-xs text-on-surface-variant">
                  {formData.isActive ? 'Cho phép phụ huynh đăng ký gói này' : 'Tạm ngưng hiển thị gói'}
                </div>
              </div>
              <Switch
                size="md"
                checked={formData.isActive}
                disabled={isFree || isUpdating}
                onChange={(val) => {
                  const nextChecked = typeof val === 'boolean' ? val : Boolean(val?.target?.checked);
                  setFormData((prev) => ({ ...prev, isActive: nextChecked }));
                }}
              />
            </div>

            {isFree && (
              <div className="p-2.5 rounded-xl bg-surface-container text-on-surface-variant text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
                <span>Gói Free mặc định của hệ thống không thể bị tắt hoặc sửa giá.</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isUpdating}
                className="rounded-full px-5 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isUpdating}
                disabled={isUpdating}
                className="rounded-full px-6 text-xs flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu thay đổi</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirmPrice}
        title="Xác nhận thay đổi giá gói cước"
        description={`Bạn có chắc chắn muốn thay đổi giá gói ${plan.name} từ ${formatCurrency(
          plan.price
        )} ₫ thành ${formatCurrency(
          formData.price
        )} ₫? Thay đổi này sẽ áp dụng cho tất cả các lượt đăng ký mới. Thuê bao hiện tại không bị ảnh hưởng.`}
        confirmLabel="Đồng ý đổi giá"
        cancelLabel="Quay lại"
        variant="warning"
        isLoading={isUpdating}
        onConfirm={submitUpdate}
        onCancel={() => setShowConfirmPrice(false)}
      />
    </>
  );
};

export default EditPlanModal;

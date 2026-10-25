import React, { useState, useEffect } from 'react';
import { Card } from '../../../../components/cards/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Switch } from '../../../../components/ui/Switch';
import { ConfirmDialog } from '../../../../components/feedback/ConfirmDialog';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
};

const QUOTA_FIELDS = [
  { key: 'childProfilesLimit', label: 'Hồ sơ trẻ tối đa', fallback: 1 },
  { key: 'discoveryViewLimitPerDay', label: 'Lượt quẹt / ngày', fallback: 5 },
  { key: 'connectionRequestsLimitPerMonth', label: 'Yêu cầu kết bạn / tháng', fallback: 5 },
  { key: 'playdatesLimitPerMonth', label: 'Cuộc hẹn tạo / tháng', fallback: 3 },
  { key: 'playdateParticipationLimitPerMonth', label: 'Cuộc hẹn tham gia / tháng', fallback: 3 },
  { key: 'aiAssistantLimitPerMonth', label: 'Yêu cầu AI / tháng', fallback: 5 },
];

export const PlanEditCard = ({ plan, onUpdate, isUpdating }) => {
  const isFree = plan.planCode === 'free';

  const [formData, setFormData] = useState({
    name: plan.name || '',
    price: plan.price || 0,
    isActive: plan.isActive ?? true,
    features: { ...(plan.features || {}) },
  });

  const [showConfirmPrice, setShowConfirmPrice] = useState(false);

  useEffect(() => {
    setFormData({
      name: plan.name || '',
      price: plan.price || 0,
      isActive: plan.isActive ?? true,
      features: { ...(plan.features || {}) },
    });
  }, [plan]);

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

  const handleSaveClick = (e) => {
    e.preventDefault();
    // If price changed and not free plan, ask confirmation
    if (!isFree && formData.price !== plan.price) {
      setShowConfirmPrice(true);
      return;
    }
    submitUpdate();
  };

  const submitUpdate = () => {
    setShowConfirmPrice(false);
    onUpdate(plan.id, formData);
  };

  return (
    <>
      <Card className="flex flex-col h-full border border-hairline hover:shadow-card transition-shadow">
        <div className="p-5 border-b border-hairline flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isFree
                    ? 'bg-hairline text-on-surface-variant'
                    : plan.planCode === 'premium_monthly'
                    ? 'bg-primary-soft text-primary-ink'
                    : 'bg-tertiary-soft text-tertiary-dark'
                }`}
              >
                {isFree ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {plan.name}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              planCode: {plan.planCode}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              checked={formData.isActive}
              disabled={isFree || isUpdating}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
              }
              label={formData.isActive ? 'Active' : 'Tạm ngưng'}
            />
          </div>
        </div>

        <form onSubmit={handleSaveClick} className="p-5 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Tên hiển thị gói
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isUpdating}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Đơn giá bán (VND)
                </label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      price: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  disabled={isFree || isUpdating}
                  min={isFree ? 0 : 1}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Thời hạn (Tháng)
                </label>
                <Input
                  value={`${plan.durationMonths} tháng`}
                  disabled
                  className="bg-surface-container/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Chu kỳ tính phí
                </label>
                <Input
                  value={plan.billingCycle}
                  disabled
                  className="bg-surface-container/50 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Đơn vị tiền tệ
                </label>
                <Input
                  value={plan.currency || 'VND'}
                  disabled
                  className="bg-surface-container/50 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-hairline">
              <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
                Cấu hình hạn mức (Quota Limits)
              </h4>

              <div className="space-y-3">
                {QUOTA_FIELDS.map(({ key, label, fallback }) => {
                  const currentValue = formData.features[key] ?? fallback;
                  const isUnlimited = currentValue === -1;

                  return (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div className="text-xs font-medium text-on-surface">
                        {label}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-on-surface-variant">
                          <Switch
                            size="sm"
                            checked={isUnlimited}
                            disabled={isUpdating}
                            onChange={() => handleFeatureToggleUnlimited(key, fallback)}
                          />
                          <span>Không giới hạn</span>
                        </label>

                        {!isUnlimited && (
                          <input
                            type="number"
                            min="0"
                            value={currentValue}
                            disabled={isUpdating}
                            onChange={(e) => handleFeatureValueChange(key, e.target.value)}
                            className="w-16 px-2 py-1 text-xs text-right border border-hairline rounded-lg bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-hairline">
            <Button
              type="submit"
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              disabled={isUpdating}
              loading={isUpdating}
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu thay đổi gói
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        open={showConfirmPrice}
        title="Xác nhận thay đổi giá gói cước"
        description={`Bạn có chắc chắn muốn thay đổi giá gói ${plan.name} từ ${formatCurrency(
          plan.price
        )} ₫ thành ${formatCurrency(
          formData.price
        )} ₫? Thay đổi này sẽ ảnh hưởng đến tất cả các giao dịch mua mới trong tương lai. Các giao dịch trong quá khứ không bị ảnh hưởng.`}
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

export default PlanEditCard;

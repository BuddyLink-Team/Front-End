import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Crown, CheckCircle2, Lock, Sliders, Edit3 } from 'lucide-react';
import { EditPlanModal } from './EditPlanModal';
import { formatCurrency } from '../../../../utils/formatters';


export const PlanEditCard = ({ plan, onUpdate, isUpdating }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isFree = plan.planCode === 'free';
  const isYearly = plan.planCode === 'premium_yearly';
  const isMonthly = plan.planCode === 'premium_monthly';

  const monthlyPriceBreakdown = isYearly && plan.price > 0 ? Math.round(plan.price / 12) : null;

  return (
    <>
      <div
        className={`bg-surface-container-lowest rounded-2xl p-6 shadow-xs border flex flex-col justify-between relative transition-all duration-300 hover:shadow-md ${
          isMonthly
            ? 'border-2 border-primary/40'
            : isYearly
            ? 'border-tertiary/40 bg-gradient-to-b from-white to-surface-container-low/30'
            : 'border-hairline'
        }`}
      >
        {/* Absolute top badge if popular or discount */}
        {isMonthly && (
          <div className="absolute -top-3 right-6 bg-primary text-on-primary px-3 py-0.5 rounded-full text-xs font-semibold shadow-xs">
            Phổ biến nhất
          </div>
        )}
        {isYearly && (
          <div className="absolute -top-3 right-6 bg-tertiary text-on-tertiary px-3 py-0.5 rounded-full text-xs font-semibold shadow-xs">
            Tiết kiệm 25%
          </div>
        )}

        <div>
          {/* Top badges */}
          <div className="flex items-center justify-between mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isFree
                  ? 'bg-surface-container-low text-on-surface-variant'
                  : isMonthly
                  ? 'bg-secondary-container/50 text-secondary'
                  : 'bg-tertiary-fixed/60 text-tertiary'
              }`}
            >
              {isFree ? 'Mặc định hệ thống' : isMonthly ? 'Gói Linh hoạt' : 'Cam kết trọn năm'}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                plan.isActive
                  ? 'bg-primary-soft text-primary-dark'
                  : 'bg-surface-container-highest text-on-surface-variant'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${plan.isActive ? 'bg-primary animate-pulse' : 'bg-outline'}`}
              />
              {plan.isActive ? (isFree ? 'Hoạt động' : 'Đang kích hoạt') : 'Tạm ngưng'}
            </span>
          </div>

          {/* Title & Description */}
          <div className="flex items-center gap-2">
            {isFree ? (
              <ShieldCheck className="w-5 h-5 text-on-surface-variant" />
            ) : isMonthly ? (
              <Sparkles className="w-5 h-5 text-primary" />
            ) : (
              <Crown className="w-5 h-5 text-tertiary" />
            )}
            <h3 className="text-lg font-bold text-on-surface">{plan.name}</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            {isFree
              ? 'Dành cho phụ huynh mới trải nghiệm kết nối cộng đồng.'
              : isMonthly
              ? 'Gia đình VIP Tháng - Kết nối linh hoạt không ràng buộc.'
              : 'Gia đình VIP Năm - Trải nghiệm hoàn hảo không âu lo.'}
          </p>

          {/* Pricing Section */}
          <div className="my-4 pb-3 border-b border-hairline">
            <div className="text-2xl font-bold tracking-tight text-on-surface">
              <span className={isFree ? 'text-on-surface' : isMonthly ? 'text-primary' : 'text-tertiary'}>
                {formatCurrency(plan.price)}
              </span>{' '}
              <span className="text-xs font-medium text-on-surface-variant">
                / {plan.billingCycle === 'yearly' ? 'năm' : 'tháng'}
              </span>
            </div>
            <span className="text-xs text-on-surface-variant">
              {isFree
                ? 'Không giới hạn thời gian sử dụng'
                : isMonthly
                ? 'Tự động gia hạn mỗi 30 ngày'
                : `Chỉ ~${formatCurrency(monthlyPriceBreakdown)}/tháng (Tiết kiệm tối đa)`}
            </span>
          </div>

          {/* Quotas & Features checklist */}
          <div className="space-y-2.5 mb-6">
            <div className="text-xs uppercase tracking-wider text-on-surface font-semibold">
              Quota &amp; Đặc quyền:
            </div>

            {isFree && (
              <>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    Tối đa <strong>{plan.features?.childProfilesLimit || 1}</strong> hồ sơ trẻ
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>{plan.features?.discoveryViewLimitPerDay || 5}</strong> lượt quẹt lịch chơi / ngày
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>{plan.features?.playdatesLimitPerMonth || 3}</strong> cuộc hẹn tạo / tháng
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface-variant/70">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Không có lọc bán kính sâu (&lt;1km)</span>
                </div>
              </>
            )}

            {isMonthly && (
              <>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    {plan.features?.childProfilesLimit === -1 ? (
                      <strong>Không giới hạn</strong>
                    ) : (
                      <strong>Tối đa {plan.features?.childProfilesLimit || 3}</strong>
                    )}{' '}
                    hồ sơ trẻ em
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Không giới hạn lượt kết nối &amp; mở chat</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Bộ lọc bán kính sâu (&lt;1km, cùng khu đô thị)</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Trợ lý AI gợi ý hoạt động theo độ tuổi bé</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Huy hiệu Phụ huynh Đã xác thực (Trust Badge)</span>
                </div>
              </>
            )}

            {isYearly && (
              <>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <span>Toàn bộ quyền lợi không giới hạn của gói VIP Tháng</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <span>Voucher giảm 20% chuỗi cafe &amp; khu vui chơi trẻ em</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <span>Hỗ trợ ưu tiên CSKH 24/7 từ chuyên viên tâm lý</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <span>Đặc quyền tham gia Offline BuddyLink Family Day</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={() => setIsEditModalOpen(true)}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
            isFree
              ? 'border border-outline-variant hover:bg-surface-container-low text-on-surface'
              : isMonthly
              ? 'bg-primary text-on-primary hover:bg-primary-dark'
              : 'bg-tertiary text-on-tertiary hover:opacity-90'
          }`}
        >
          {isFree ? <Sliders className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isFree ? 'Chỉnh sửa cấu hình' : 'Chỉnh sửa gói'}</span>
        </button>
      </div>

      <EditPlanModal
        plan={plan}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (id, data) => {
          if (await onUpdate(id, data)) setIsEditModalOpen(false);
        }}
        isUpdating={isUpdating}
      />
    </>
  );
};

export default PlanEditCard;

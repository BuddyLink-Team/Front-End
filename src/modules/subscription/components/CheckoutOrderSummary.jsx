import PropTypes from 'prop-types';
import { ExternalLink, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { getPlanBenefits } from '../utils/planBenefits';

/**
 * Pending checkout, left column: order details, Premium benefits (plan.features) and the PayOS hosted page link.
 */
export const CheckoutOrderSummary = ({ orderData, planFeatures, durationText, formattedAmount }) => (
  <div className="space-y-6">
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Chi tiết đơn hàng</span>
        <span className="font-mono text-xs font-bold text-on-surface">#{orderData.orderCode}</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Gói dịch vụ:</span>
          <span className="font-semibold text-on-surface">
            {orderData.planSnapshot?.name || orderData.planName || 'Gói Hội Viên Premium'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-on-surface-variant">Thời hạn:</span>
          <span className="font-medium text-on-surface">{durationText}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-outline-variant/30 text-base font-bold">
          <span className="text-on-surface">Tổng thanh toán:</span>
          <span className="text-primary text-xl font-extrabold">{formattedAmount}</span>
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
        <Sparkles className="w-4 h-4" />
        <span>Quyền lợi kích hoạt ngay:</span>
      </div>
      <ul className="text-xs text-on-surface-variant space-y-2">
        {getPlanBenefits(planFeatures, true).map((benefit) => (
          <li key={benefit.key} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>
              {benefit.name}: {benefit.text.toLowerCase()}
            </span>
          </li>
        ))}
      </ul>
    </div>

    {orderData.checkoutUrl && (
      <a href={orderData.checkoutUrl} target="_blank" rel="noopener noreferrer" className="block">
        <Button
          variant="outline"
          className="w-full text-xs font-medium"
          leftIcon={<ExternalLink className="w-4 h-4 text-primary" />}
        >
          Mở trang thanh toán PayOS
        </Button>
      </a>
    )}
  </div>
);

CheckoutOrderSummary.propTypes = {
  orderData: PropTypes.object.isRequired,
  planFeatures: PropTypes.object,
  durationText: PropTypes.string.isRequired,
  formattedAmount: PropTypes.string.isRequired,
};

export default CheckoutOrderSummary;

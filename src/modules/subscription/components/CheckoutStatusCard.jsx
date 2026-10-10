import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';

const TONES = {
  success: { border: 'border-primary/30', icon: 'bg-primary/10 text-primary' },
  error: { border: 'border-error/30', icon: 'bg-error/10 text-error' },
  neutral: { border: 'border-outline-variant/60', icon: 'bg-surface-container-high text-on-surface-variant' },
};

/**
 * Final state of a checkout (paid, failed / cancelled, expired): icon, title, description and actions.
 */
export const CheckoutStatusCard = ({ icon: Icon, tone = 'neutral', title, description, children, actions }) => (
  <div
    className={cn(
      'rounded-3xl border bg-surface-container-lowest p-8 sm:p-12 text-center space-y-6 shadow-sm',
      TONES[tone].border
    )}
  >
    <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full', TONES[tone].icon)}>
      <Icon className="w-9 h-9" />
    </div>
    <div className="space-y-2 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-on-surface">{title}</h2>
      <div className="text-sm text-on-surface-variant">{description}</div>
    </div>
    {children}
    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">{actions}</div>
  </div>
);

CheckoutStatusCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  tone: PropTypes.oneOf(['success', 'error', 'neutral']),
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.node,
};

export default CheckoutStatusCard;

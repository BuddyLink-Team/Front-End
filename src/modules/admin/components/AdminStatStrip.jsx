import React from 'react';
import PropTypes from 'prop-types';
import { StatCard } from '../../../components/cards/StatCard';
import { formatCount } from '../../../utils/formatters';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

/**
 * Platform-wide counts above an admin list (not affected by its filters)
 */
export const AdminStatStrip = ({ cards, stats, isLoading, hasError }) => (
  <div className="space-y-2">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(({ key, label, icon: Icon, variant, format = formatCount }) => (
        <StatCard
          key={key}
          icon={<Icon size={ICON_SIZE.LG} strokeWidth={ICON_STROKE.DEFAULT} />}
          title={label}
          value={isLoading && !stats ? '…' : format(stats?.[key])}
          variant={variant}
          className="p-4 gap-3"
        />
      ))}
    </div>
    {hasError && <p className="text-label-md text-error">Không tải được số liệu thống kê.</p>}
  </div>
);

AdminStatStrip.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      variant: PropTypes.string,
      // Formats the value (default: formatCount)
      format: PropTypes.func,
    })
  ).isRequired,
  stats: PropTypes.object,
  isLoading: PropTypes.bool,
  hasError: PropTypes.bool,
};

export default AdminStatStrip;

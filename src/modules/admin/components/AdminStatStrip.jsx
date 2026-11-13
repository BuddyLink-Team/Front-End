import React from 'react';
import PropTypes from 'prop-types';
import { StatCard } from '../../../components/cards/StatCard';
import { formatCount } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

/**
 * Platform-wide counts above an admin list (not affected by its filters)
 */
// The cards always fill the row: three on one line, four on two then one line
const GRID_BY_COUNT = {
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
};

export const AdminStatStrip = ({ cards, stats, isLoading, hasError }) => (
  <div className="space-y-2">
    <div className={cn('grid gap-3 sm:gap-4', GRID_BY_COUNT[cards.length] || GRID_BY_COUNT[4])}>
      {cards.map(({ key, label, icon: Icon, variant, format = formatCount }) => (
        <StatCard
          key={key}
          icon={<Icon size={ICON_SIZE.LG} strokeWidth={ICON_STROKE.DEFAULT} />}
          title={label}
          value={stats ? format(stats[key]) : undefined}
          variant={variant}
          isLoading={isLoading && !stats}
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

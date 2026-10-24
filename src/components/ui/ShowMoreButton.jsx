import React from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Compact "Xem thêm N … / Thu gọn" toggle under a shortened list (see useShowMore)
 */
export const ShowMoreButton = ({ isExpanded, hiddenCount, unit = '', onToggle, className }) => (
  <div className={cn('flex justify-center', className)}>
    <button
      type="button"
      aria-expanded={isExpanded}
      onClick={onToggle}
      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-primary-dark hover:bg-primary-soft transition-colors"
    >
      {isExpanded ? 'Thu gọn' : `Xem thêm ${hiddenCount}${unit ? ` ${unit}` : ''}`}
      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-180')} />
    </button>
  </div>
);

ShowMoreButton.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
  hiddenCount: PropTypes.number.isRequired,
  unit: PropTypes.string,
  onToggle: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default ShowMoreButton;

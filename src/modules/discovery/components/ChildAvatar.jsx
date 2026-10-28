import React from 'react';
import PropTypes from 'prop-types';
import { cn } from '../../../utils/cn';
import { DEFAULT_CHILD_AVATARS, GENDER_LABELS } from '../constants/discoveryConstants';

const SIZES = {
  sm: 'w-14 h-14 rounded-xl',
  md: 'w-24 h-24 rounded-2xl',
  lg: 'w-avatar-3xl h-avatar-3xl rounded-2xl',
};

/**
 * Cartoon boy/girl avatar with the gender strip (Discovery card style).
 * @param {string} [gender] - Child gender; anything but girl shows the boy avatar
 * @param {'sm'|'md'|'lg'} [size='lg']
 */
export const ChildAvatar = ({ gender, alt, size = 'lg', className }) => {
  const genderLabel = GENDER_LABELS[gender] || '';

  return (
    <div
      className={cn(
        'relative shrink-0 bg-primary-container overflow-hidden flex items-center justify-center border border-primary',
        SIZES[size] || SIZES.lg,
        className,
      )}
    >
      <img
        alt={alt}
        src={DEFAULT_CHILD_AVATARS[gender] || DEFAULT_CHILD_AVATARS.DEFAULT}
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      {genderLabel && (
        <span className="absolute bottom-0 left-0 right-0 text-center bg-secondary text-secondary-on-secondary text-label-xs font-bold py-0.5">
          {genderLabel}
        </span>
      )}
    </div>
  );
};

ChildAvatar.propTypes = {
  gender: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default ChildAvatar;

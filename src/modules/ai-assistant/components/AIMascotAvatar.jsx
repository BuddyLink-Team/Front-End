import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Bot } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { ICON_STROKE } from '../../../constants/icon.constants';
// The round mascot of the BuddyLink logo (cropped from assets/images/logo.png)
import mascot from '../../../assets/images/ai-mascot.png';

const SIZES = {
  sm: { box: 'w-8 h-8', icon: 'w-4 h-4' },
  md: { box: 'w-10 h-10', icon: 'w-5 h-5' },
  lg: { box: 'w-14 h-14', icon: 'w-7 h-7' },
};

/**
 * BuddyLink mascot shown next to the assistant's messages (the Bot icon if the image cannot load)
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {string} [className]
 */
export const AIMascotAvatar = ({ size = 'md', className }) => {
  const [hasFailed, setHasFailed] = useState(false);
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft border border-primary-border overflow-hidden',
        sizeClass.box,
        className,
      )}
      aria-hidden="true"
    >
      {hasFailed ? (
        <Bot className={cn(sizeClass.icon, 'text-primary-dark')} strokeWidth={ICON_STROKE.DEFAULT} />
      ) : (
        <img src={mascot} alt="" className="w-full h-full object-cover" onError={() => setHasFailed(true)} />
      )}
    </span>
  );
};

AIMascotAvatar.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default AIMascotAvatar;

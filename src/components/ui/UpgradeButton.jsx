import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

/**
 * UpgradeButton - Premium upgrade call-to-action (style of the child management page).
 * Pure UI: the caller decides what happens on click (e.g. navigate to /subscription).
 *
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {React.ReactNode} [children='Nâng cấp'] - Button label
 * @param {Function} [onClick]
 * @param {string} [className]
 */
export const UpgradeButton = ({ size = 'md', children = 'Nâng cấp', className, ...props }) => {
  const sizes = {
    sm: { button: 'px-3 py-1.5 text-xs', icon: 'w-3.5 h-3.5' },
    md: { button: 'px-5 py-3 text-sm', icon: 'w-4 h-4' },
    lg: { button: 'px-6 py-3.5 text-base', icon: 'w-5 h-5' },
  };
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <Button
      type="button"
      size={size}
      leftIcon={<Crown className={cn(sizeStyle.icon, 'text-white')} />}
      className={cn(
        'rounded-xl shadow-md font-semibold bg-amber-400 hover:bg-amber-400/90 text-white',
        sizeStyle.button,
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default UpgradeButton;

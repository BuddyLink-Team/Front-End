import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useClickOutside } from '../../hooks/useClickOutside';

/**
 * Dropdown Menu Container
 */
export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
  menuClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  useClickOutside(dropdownRef, isOpen, closeDropdown);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={toggleDropdown} className="cursor-pointer select-none rounded-full outline-none focus:outline-none">
        {trigger}
      </div>

      {isOpen && (
        <div
          onClick={(e) => {
            // Close dropdown if an item or link inside is clicked
            if (e.target.closest('a') || e.target.closest('button')) {
              closeDropdown();
            }
          }}
          className={`absolute ${alignmentClasses[align]} mt-2 w-56 sm:w-64 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl shadow-surface-tint/10 border border-hairline ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 duration-150 ${menuClassName}`}
          role="menu"
          tabIndex="-1"
        >
          {children}
        </div>
      )}
    </div>
  );
};

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  align: PropTypes.oneOf(['left', 'right', 'center']),
  className: PropTypes.string,
  menuClassName: PropTypes.string,
};

/**
 * Dropdown Item
 */
export const DropdownItem = ({
  children,
  onClick,
  icon: Icon,
  danger = false,
  className = '',
  as = 'button',
  ...props
}) => {
  const Component = as;

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-150 text-left ${
        danger
          ? 'text-error hover:bg-red-50'
          : 'text-text-primary hover:bg-surface-container-low hover:text-primary'
      } ${className}`}
      role="menuitem"
      {...props}
    >
      {Icon && (
        React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon
            className={`w-4 h-4 shrink-0 ${
              danger ? 'text-error' : 'text-text-muted group-hover:text-primary'
            }`}
          />
        )
      )}
      <span className="flex-1">{children}</span>
    </Component>
  );
};

DropdownItem.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]),
  danger: PropTypes.bool,
  className: PropTypes.string,
  as: PropTypes.elementType,
};

/**
 * Dropdown Divider
 */
export const DropdownDivider = ({ className = '' }) => (
  <div className={`my-1.5 h-px bg-hairline ${className}`} />
);

DropdownDivider.propTypes = {
  className: PropTypes.string,
};

/**
 * Dropdown Header / Section Label
 */
export const DropdownHeader = ({ children, className = '' }) => (
  <div className={`px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-text-muted ${className}`}>
    {children}
  </div>
);

DropdownHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Dropdown;

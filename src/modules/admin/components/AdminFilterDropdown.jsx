import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Dropdown, DropdownItem, DropdownHeader } from '../../../components/ui/Dropdown';
import { cn } from '../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

/**
 * AdminFilterDropdown - single-choice filter button for AdminListToolbar (severity, category, target type...).
 * The first option with an empty value means "no filter".
 *
 * @param {React.ElementType} [icon] - Optional Lucide icon shown before the label
 * @param {string} [header] - Menu title (falls back to label)
 * @param {string} [label] - Menu title when header is not given
 * @param {Array<{ label: string, value: string }>} options
 * @param {string} [value] - Selected value ('' or undefined = no filter)
 * @param {Function} onChange - Receives the chosen value
 * @param {'left'|'right'|'center'} [align] - Alignment of the dropdown menu
 * @param {string} [labelPrefix] - Text prefix for the button (e.g. "Chu kỳ:")
 * @param {string} [className] - Wrapper class
 * @param {string} [buttonClassName] - Button class
 */
export const AdminFilterDropdown = ({
  icon: Icon,
  header,
  label,
  options = [],
  value = '',
  onChange,
  align = 'left',
  labelPrefix,
  className,
  buttonClassName,
}) => {
  const selected = options.find((opt) => opt.value === value) || options[0];
  const isDefaultOption = !value || value === 'all' || value === options[0]?.value;
  const isActive = !isDefaultOption;
  const menuHeader = header || label;

  return (
    <Dropdown
      align={align}
      className={className}
      trigger={
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'border shadow-2xs whitespace-nowrap rounded-xl transition-all',
            isActive
              ? 'bg-primary-soft text-primary-dark border-primary-border font-semibold hover:bg-primary-tint-hover'
              : 'bg-surface-container-lowest border-hairline hover:border-hairline-strong text-text-primary',
            buttonClassName
          )}
          leftIcon={
            Icon ? (
              <Icon
                size={ICON_SIZE.SM}
                strokeWidth={ICON_STROKE.DEFAULT}
                className={isActive ? 'text-primary' : 'text-text-muted'}
              />
            ) : null
          }
          rightIcon={<ChevronDown size={ICON_SIZE.XS} className="text-text-muted ml-0.5" />}
        >
          {labelPrefix ? `${labelPrefix} ${selected?.label || ''}` : selected?.label}
        </Button>
      }
    >
      {menuHeader && <DropdownHeader>{menuHeader}</DropdownHeader>}
      {options.map((opt) => {
        const isSelected =
          opt.value === value || (!value && !opt.value) || (value === 'all' && opt.value === 'all');
        return (
          <DropdownItem
            key={opt.value || 'all'}
            onClick={() => onChange(opt.value)}
            className={cn(isSelected && 'text-primary-dark font-semibold bg-primary-soft')}
          >
            {opt.label}
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
};

export default AdminFilterDropdown;

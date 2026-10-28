import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Dropdown, DropdownItem, DropdownHeader } from '../../../components/ui/Dropdown';
import { cn } from '../../../utils/cn';
import { ICON_SIZE, ICON_STROKE } from '../../../constants/icon.constants';

/**
 * AdminFilterDropdown - single-choice filter button for AdminListToolbar (verification, gender, age...).
 * The first option with an empty value means "no filter".
 *
 * @param {React.ElementType} icon - Lucide icon shown before the label
 * @param {string} header - Menu title
 * @param {Array<{ label: string, value: string }>} options
 * @param {string} [value] - Selected value ('' or undefined = no filter)
 * @param {Function} onChange - Receives the chosen value
 */
export const AdminFilterDropdown = ({ icon: Icon, header, options, value = '', onChange }) => {
  const selected = options.find((opt) => opt.value === value) || options[0];
  const isActive = Boolean(value);

  return (
    <Dropdown
      align="left"
      trigger={
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'border shadow-2xs whitespace-nowrap',
            isActive
              ? 'bg-primary-soft text-primary-dark border-primary-border font-semibold hover:bg-primary-tint-hover'
              : 'bg-surface-container-lowest border-hairline hover:border-hairline-strong'
          )}
          leftIcon={
            <Icon
              size={ICON_SIZE.SM}
              strokeWidth={ICON_STROKE.DEFAULT}
              className={isActive ? 'text-primary' : 'text-text-muted'}
            />
          }
          rightIcon={<ChevronDown size={ICON_SIZE.XS} className="text-text-muted" />}
        >
          {selected.label}
        </Button>
      }
    >
      <DropdownHeader>{header}</DropdownHeader>
      {options.map((opt) => (
        <DropdownItem
          key={opt.value || 'all'}
          onClick={() => onChange(opt.value)}
          className={cn(opt.value === value && 'text-primary font-semibold bg-primary-soft/40')}
        >
          {opt.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};

export default AdminFilterDropdown;

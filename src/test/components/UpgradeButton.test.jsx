import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpgradeButton } from '../../components/ui/UpgradeButton';

describe('UpgradeButton', () => {
  it('renders the default label with the shared upgrade style', () => {
    render(<UpgradeButton />);
    const button = screen.getByRole('button', { name: 'Nâng cấp' });
    expect(button.className).toContain('bg-amber-400');
    expect(button.className).toContain('rounded-xl');
    expect(button.className).toContain('px-5');
  });

  it('accepts a custom label, size and click handler', () => {
    const onClick = vi.fn();
    render(
      <UpgradeButton size="sm" onClick={onClick}>
        Nâng cấp để thêm bé
      </UpgradeButton>,
    );
    const button = screen.getByRole('button', { name: 'Nâng cấp để thêm bé' });
    expect(button.className).toContain('px-3');
    expect(button.className).toContain('text-xs');
    expect(button.className).not.toContain('px-5');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

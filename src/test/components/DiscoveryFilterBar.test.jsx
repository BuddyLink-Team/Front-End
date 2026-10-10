import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DiscoveryFilterBar } from '../../modules/discovery/components/DiscoveryFilterBar';

const baseProps = {
  meta: { isPremium: true },
  remainingViewsLabel: '5 lượt',
  filterSummary: { hasActiveFilter: false, distanceLabel: '15 km', ageLabel: '1-12 tuổi' },
  onOpenFilter: vi.fn(),
  onUpgrade: vi.fn(),
};

describe('DiscoveryFilterBar child selector', () => {
  it('shows the child name as text when the parent has one child', () => {
    render(
      <DiscoveryFilterBar {...baseProps} searchingForLabel="Na" childOptions={[{ value: 'k1', label: 'Na' }]} selectedChildId="k1" />,
    );
    expect(screen.getByText('Na')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('lets the parent pick a child when there are several', () => {
    const onSelectChild = vi.fn();
    render(
      <DiscoveryFilterBar
        {...baseProps}
        searchingForLabel="Na"
        childOptions={[
          { value: 'k1', label: 'Na' },
          { value: 'k2', label: 'Bin' },
        ]}
        selectedChildId="k1"
        onSelectChild={onSelectChild}
      />,
    );
    const select = screen.getByRole('combobox', { name: 'Chọn bé để tìm bạn' });
    expect(select).toHaveValue('k1');
    fireEvent.change(select, { target: { value: 'k2' } });
    expect(onSelectChild).toHaveBeenCalledWith('k2');
  });
});

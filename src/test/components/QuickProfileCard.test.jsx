import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickProfileCard from '../../modules/connection/components/QuickProfileCard';
import { CONNECTION_LISTS } from '../../modules/connection/constants/connection.constants';

const CONNECTION = {
  id: 'conn-1',
  partnerId: 'parent-2',
  parentName: 'Mẹ Lan',
  childName: 'Bé Bắp',
  childAge: 5,
  childGender: 'boy',
  isVerified: false,
  interests: [],
  area: 'Quận 1',
  avatarUrl: '',
  preferredDays: [],
  preferredTimeSlots: [],
  preferredLocations: [],
};

describe('QuickProfileCard', () => {
  it('reports the selected parent from the profile card', () => {
    const onReport = vi.fn();
    render(
      <QuickProfileCard
        connection={CONNECTION}
        type={CONNECTION_LISTS.ACCEPTED}
        onAction={vi.fn()}
        onMessage={vi.fn()}
        onInvite={vi.fn()}
        onReport={onReport}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Báo cáo người dùng' }));
    expect(onReport).toHaveBeenCalledWith(CONNECTION);
  });
});

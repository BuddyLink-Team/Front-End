import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileInfoTab } from '../../modules/parent/components/ProfileInfoTab';

const PROFILE = {
  fullName: 'Nguyễn Thu Hà',
  bio: '',
  location: { area: 'Phường Bến Nghé', city: 'TP. Hồ Chí Minh', address: 'Phường Bến Nghé, TP. Hồ Chí Minh' },
};

describe('ProfileInfoTab location', () => {
  it('rebuilds the address from the new area and city instead of resending the saved one', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<ProfileInfoTab profile={PROFILE} onUpdate={onUpdate} isUpdating={false} />);

    fireEvent.change(screen.getByLabelText(/Phường \/ Xã/), { target: { value: 'Phường Đa Kao' } });
    fireEvent.change(screen.getByLabelText(/Tỉnh \/ Thành phố/), { target: { value: 'TP. Thủ Đức' } });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(onUpdate.mock.calls[0][0].location).toEqual({
      area: 'Phường Đa Kao',
      city: 'TP. Thủ Đức',
      address: 'Phường Đa Kao, TP. Thủ Đức',
    });
  });
});

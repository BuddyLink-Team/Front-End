import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileInfoTab } from '../../modules/parent/components/ProfileInfoTab';

const PROFILE = {
  fullName: 'Nguyễn Thu Hà',
  phone: '+84901234567',
  bio: '',
  location: { area: 'Phường Bến Nghé', city: 'TP. Hồ Chí Minh', address: 'Phường Bến Nghé, TP. Hồ Chí Minh' },
};

describe('ProfileInfoTab phone', () => {
  it('shows the saved number as a required field and sends the new one', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<ProfileInfoTab profile={PROFILE} onUpdate={onUpdate} isUpdating={false} />);

    const phone = screen.getByLabelText(/^Số điện thoại/);
    expect(phone).toHaveValue('+84901234567');
    expect(phone).toHaveAttribute('aria-required', 'true');

    fireEvent.change(phone, { target: { value: '0907654321' } });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(onUpdate.mock.calls[0][0].phone).toBe('0907654321');
  });

  it('does not save an empty number', async () => {
    const onUpdate = vi.fn();
    render(<ProfileInfoTab profile={PROFILE} onUpdate={onUpdate} isUpdating={false} />);

    fireEvent.change(screen.getByLabelText(/^Số điện thoại/), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Lưu thay đổi/ }));

    expect(await screen.findByText('Vui lòng nhập số điện thoại')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });
});

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

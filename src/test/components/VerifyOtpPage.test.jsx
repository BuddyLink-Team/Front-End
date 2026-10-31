import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VerifyOtpPage } from '../../modules/auth/pages/VerifyOtpPage';
import { useVerifyOtp } from '../../modules/auth/hooks/useVerifyOtp';

vi.mock('../../modules/auth/hooks/useVerifyOtp', () => ({ useVerifyOtp: vi.fn() }));

const mockHook = (overrides) => {
  useVerifyOtp.mockReturnValue({
    user: { email: 'ha@example.com' },
    isPhoneVerified: false,
    isEmailVerified: false,
    activeStep: 'PHONE',
    phoneNumber: '+84901234567',
    isEditingPhone: false,
    setIsEditingPhone: vi.fn(),
    newPhoneInput: '+84901234567',
    setNewPhoneInput: vi.fn(),
    otpDigits: ['', '', '', '', '', ''],
    inputRefs: { current: [] },
    countdown: 0,
    canResend: true,
    isPhoneOtpSent: true,
    isSendingPhoneOtp: false,
    isSubmitting: false,
    errorMessage: null,
    isFormComplete: false,
    handleDigitChange: vi.fn(),
    handleKeyDown: vi.fn(),
    handlePaste: vi.fn(),
    handleResendOtp: vi.fn(),
    handleSendPhoneCode: vi.fn(),
    handleVerifySubmit: vi.fn(),
    handleSavePhone: vi.fn(),
    ...overrides,
  });
};

describe('VerifyOtpPage steps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows only the SMS step when the email is already verified', () => {
    mockHook({ isEmailVerified: true });
    render(<VerifyOtpPage />);

    expect(screen.getByText('Chỉ cần xác thực SMS')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xác nhận & Hoàn tất' })).toBeInTheDocument();
    expect(screen.queryByText(/Bước 1\/2/)).not.toBeInTheDocument();
    expect(screen.queryByText('Tiến trình hồ sơ phụ huynh')).not.toBeInTheDocument();
    expect(screen.queryByText('3. Xác thực Email')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /xác thực Email/ })).not.toBeInTheDocument();
  });

  it('keeps both steps for an account whose email is not verified yet', () => {
    mockHook({ isEmailVerified: false });
    render(<VerifyOtpPage />);

    expect(screen.getByText(/Bước 1\/2/)).toBeInTheDocument();
    expect(screen.getByText('Tiến trình hồ sơ phụ huynh')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tiếp tục xác thực Email/ })).toBeInTheDocument();
  });

  it('keeps the email step when the phone is done and the email is not', () => {
    mockHook({ isPhoneVerified: true, activeStep: 'EMAIL' });
    render(<VerifyOtpPage />);

    expect(screen.getByText(/Bước 2\/2/)).toBeInTheDocument();
    expect(screen.queryByText('Chỉ cần xác thực SMS')).not.toBeInTheDocument();
  });
});

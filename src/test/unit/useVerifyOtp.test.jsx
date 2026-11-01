import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import childReducer from '../../modules/child/redux/childSlice';
import parentReducer from '../../modules/parent/redux/parentSlice';
import { childApi } from '../../modules/child/api/childApi';
import { useVerifyOtp } from '../../modules/auth/hooks/useVerifyOtp';

const navigate = vi.fn();
const handleVerifyPhoneOtp = vi.fn();

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }));
vi.mock('../../services/firebase', () => ({
  isFirebaseConfigured: () => false,
  initRecaptchaVerifier: vi.fn(),
  clearRecaptchaVerifier: vi.fn(),
  sendFirebasePhoneOtp: vi.fn(),
}));
vi.mock('../../modules/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    setErrorMessage: vi.fn(),
    handleSendPhoneOtp: vi.fn(),
    handleVerifyPhoneOtp,
    handleVerifyFirebasePhone: vi.fn(),
    handleSendEmailOtp: vi.fn(),
    handleVerifyEmailOtp: vi.fn(),
  }),
}));

const setup = () => {
  const store = configureStore({
    reducer: {
      auth: () => ({
        user: { role: 'parent', phone: '+84907654321' },
        parent: { verification: { isPhoneVerified: false, isEmailVerified: true } },
      }),
      child: childReducer,
      parent: parentReducer,
    },
    preloadedState: {
      parent: { profile: { phone: '+84901234567' }, isLoading: false, isUpdating: false, isUploadingAvatar: false, error: null },
    },
  });
  const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  return { store, ...renderHook(() => useVerifyOtp(), { wrapper }) };
};

const submitOtp = async (result) => {
  '123456'.split('').forEach((digit, index) => {
    act(() => result.current.handleDigitChange(index, digit));
  });
  await act(async () => {
    await result.current.handleVerifySubmit();
  });
};

describe('useVerifyOtp after the phone is verified', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handleVerifyPhoneOtp.mockResolvedValue({ success: true });
  });

  it('sends a parent who already has children home and drops the cached profile', async () => {
    vi.spyOn(childApi, 'getMyChildren').mockResolvedValue([{ id: 'c1' }]);
    const { result, store } = setup();

    await submitOtp(result);

    expect(navigate).toHaveBeenCalledWith('/discovery', { replace: true });
    expect(store.getState().parent.profile).toBeNull();
  });

  it('sends a parent without children to onboarding', async () => {
    vi.spyOn(childApi, 'getMyChildren').mockResolvedValue([]);
    const { result } = setup();

    await submitOtp(result);

    expect(navigate).toHaveBeenCalledWith('/onboarding-child', { replace: true });
  });

  it('falls back to onboarding when the children cannot be loaded', async () => {
    vi.spyOn(childApi, 'getMyChildren').mockRejectedValue(new Error('offline'));
    const { result } = setup();

    await submitOtp(result);

    expect(navigate).toHaveBeenCalledWith('/onboarding-child', { replace: true });
  });
});

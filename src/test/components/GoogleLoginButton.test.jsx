import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GoogleLoginButton } from '../../modules/auth/components/GoogleLoginButton';

// Stand-in for Google's OAuth popup: records the options and lets a test answer like Google would
const google = vi.hoisted(() => ({ scriptLoaded: true, options: null, login: null }));
vi.mock('@react-oauth/google', () => ({
  useGoogleOAuth: () => ({ scriptLoadedSuccessfully: google.scriptLoaded }),
  useGoogleLogin: (options) => {
    google.options = options;
    return google.login;
  },
}));

const deferred = () => {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'client-id');
    google.scriptLoaded = true;
    google.options = null;
    google.login = vi.fn();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('opens the Google popup from our own button (no hidden GSI iframe over it)', () => {
    const { container } = render(<GoogleLoginButton onSuccess={vi.fn()} />);

    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(google.login).toHaveBeenCalledTimes(1);
  });

  it('sends the access token to the backend and shows the loader meanwhile', async () => {
    const backend = deferred();
    const onSuccess = vi.fn(() => backend.promise);
    render(<GoogleLoginButton onSuccess={onSuccess} />);

    await act(async () => {
      google.options.onSuccess({ access_token: 'access-token' });
    });
    expect(onSuccess).toHaveBeenCalledWith({ accessToken: 'access-token' });
    expect(screen.getByRole('button', { name: /Đang xác thực Google/ })).toBeDisabled();

    // The backend answers late or fails: the button can be clicked again
    await act(async () => backend.resolve({ success: false }));
    const button = screen.getByRole('button', { name: /Google/ });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(google.login).toHaveBeenCalledTimes(1);
  });

  it('explains a slow server while the backend verifies', async () => {
    vi.useFakeTimers();
    const backend = deferred();
    render(<GoogleLoginButton onSuccess={() => backend.promise} />);

    await act(async () => {
      google.options.onSuccess({ access_token: 'access-token' });
    });
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole('status')).toHaveTextContent('Máy chủ đang khởi động');

    await act(async () => backend.resolve());
    vi.useRealTimers();
  });

  it('tells the parent when the browser blocked the popup', () => {
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    act(() => google.options.onNonOAuthError({ type: 'popup_failed_to_open' }));
    expect(screen.getByRole('alert')).toHaveTextContent('chặn cửa sổ Google');
  });

  it('says so when the Google script did not load', () => {
    google.scriptLoaded = false;
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(google.login).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Không tải được đăng nhập Google');
  });

  it('uses the custom click without a Google client id', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    const onClick = vi.fn();
    render(<GoogleLoginButton onSuccess={vi.fn()} onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(onClick).toHaveBeenCalled();
    expect(google.login).not.toHaveBeenCalled();
  });
});

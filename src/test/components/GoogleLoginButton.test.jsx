import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GoogleLoginButton } from '../../modules/auth/components/GoogleLoginButton';

// Stand-in for the GSI button: counts its mounts and lets a test answer like Google would
const gsi = vi.hoisted(() => ({ scriptLoaded: true, mounts: 0, props: null }));
vi.mock('@react-oauth/google', () => ({
  useGoogleOAuth: () => ({ scriptLoadedSuccessfully: gsi.scriptLoaded }),
  GoogleLogin: (props) => {
    gsi.props = props;
    useEffect(() => {
      gsi.mounts += 1;
    }, []);
    return <div data-testid="gsi-button" />;
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
    gsi.scriptLoaded = true;
    gsi.mounts = 0;
    gsi.props = null;
  });
  afterEach(() => vi.unstubAllEnvs());

  it('lays the GSI button over the custom one once Google has loaded', () => {
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    expect(screen.getByTestId('google-gsi-overlay')).toBeInTheDocument();
  });

  it('never leaves an empty overlay when the Google script did not load', () => {
    gsi.scriptLoaded = false;
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    expect(screen.queryByTestId('google-gsi-overlay')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('Không tải được đăng nhập Google');
  });

  it('shows the loader while the backend verifies, then mounts a fresh GSI button', async () => {
    const backend = deferred();
    const onSuccess = vi.fn(() => backend.promise);
    render(<GoogleLoginButton onSuccess={onSuccess} />);
    expect(gsi.mounts).toBe(1);

    await act(async () => {
      gsi.props.onSuccess({ credential: 'id-token' });
    });
    expect(onSuccess).toHaveBeenCalledWith('id-token');
    expect(screen.getByText('Đang xác thực Google...')).toBeInTheDocument();
    expect(screen.queryByTestId('google-gsi-overlay')).not.toBeInTheDocument();

    // The backend answers late (or fails): the next click must reach a new GSI button
    await act(async () => backend.resolve({ success: false }));
    expect(screen.getByTestId('google-gsi-overlay')).toBeInTheDocument();
    expect(gsi.mounts).toBe(2);
  });

  it('mounts a fresh GSI button after Google reports an error', () => {
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    act(() => gsi.props.onError());

    expect(gsi.mounts).toBe(2);
  });

  it('uses the custom click without a Google client id', () => {
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '');
    const onClick = vi.fn();
    render(<GoogleLoginButton onSuccess={vi.fn()} onClick={onClick} />);

    expect(screen.queryByTestId('google-gsi-overlay')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(onClick).toHaveBeenCalled();
  });
});

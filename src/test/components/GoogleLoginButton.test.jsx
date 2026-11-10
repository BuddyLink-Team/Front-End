import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GoogleLoginButton } from '../../modules/auth/components/GoogleLoginButton';

// Stand-in for the GSI button: counts its mounts and lets a test answer like Google would
const gsi = vi.hoisted(() => ({ scriptLoaded: true, mounts: 0, props: null, draws: true }));
vi.mock('@react-oauth/google', () => ({
  useGoogleOAuth: () => ({ scriptLoadedSuccessfully: gsi.scriptLoaded }),
  GoogleLogin: (props) => {
    gsi.props = props;
    useEffect(() => {
      gsi.mounts += 1;
    }, []);
    // Google draws its button in an iframe; `draws: false` is a GSI button that failed to render
    return <div data-testid="gsi-button">{gsi.draws && <iframe title="Sign in with Google" />}</div>;
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
    gsi.draws = true;
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

  it('lets the clicks through an overlay Google did not draw, and draws the button again', () => {
    gsi.draws = false;
    const prompt = vi.fn();
    window.google = { accounts: { id: { prompt } } };
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    const overlay = screen.getByTestId('google-gsi-overlay');
    expect(overlay).toHaveAttribute('data-ready', 'false');
    expect(overlay.className).toContain('pointer-events-none');

    fireEvent.click(screen.getByRole('button', { name: /Google/ }));
    expect(gsi.mounts).toBe(2);
    expect(prompt).toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Nút Google đang được tải lại');
    delete window.google;
  });

  it('takes the clicks only once the GSI button is drawn', () => {
    render(<GoogleLoginButton onSuccess={vi.fn()} />);

    const overlay = screen.getByTestId('google-gsi-overlay');
    expect(overlay).toHaveAttribute('data-ready', 'true');
    expect(overlay.className).toContain('cursor-pointer');
  });

  it('explains a slow server while the backend verifies', async () => {
    vi.useFakeTimers();
    const backend = deferred();
    render(<GoogleLoginButton onSuccess={() => backend.promise} />);

    await act(async () => {
      gsi.props.onSuccess({ credential: 'id-token' });
    });
    act(() => vi.advanceTimersByTime(7000));
    expect(screen.getByRole('status')).toHaveTextContent('Máy chủ đang khởi động');

    await act(async () => backend.resolve());
    vi.useRealTimers();
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

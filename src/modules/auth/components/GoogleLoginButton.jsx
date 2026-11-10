import React, { useEffect, useState } from 'react';
import { useGoogleLogin, useGoogleOAuth } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

const GOOGLE_UNAVAILABLE_MESSAGE =
  'Không tải được đăng nhập Google. Vui lòng kiểm tra kết nối rồi tải lại trang.';
const POPUP_BLOCKED_MESSAGE = 'Trình duyệt đã chặn cửa sổ Google. Bạn cho phép cửa sổ bật lên rồi bấm lại nhé.';
const SLOW_SERVER_MESSAGE = 'Máy chủ đang khởi động, có thể mất đến 1 phút. Bạn chờ một chút nhé.';

// The backend still verifying after this long: it is probably starting up (cold start)
const SLOW_SERVER_AFTER_MS = 6000;
// Never stuck on the loader: past the longest auth request (60 s) the button is usable again
const LOADING_WATCHDOG_MS = 75000;

/**
 * Our own Google button: a click opens Google's account chooser (OAuth popup) and the access token it
 * returns is verified by the backend (POST /auth/google { accessToken }).
 * No invisible GSI iframe is laid over it any more: Google ignores clicks on a hidden or transformed
 * sign-in iframe (clickjacking protection), which left the button dead.
 * @param {(credential: { accessToken: string }) => Promise<unknown>|void} onSuccess
 * @param {Function} [onClick] - Used without a Google client id (local mock sign-in)
 */
export const GoogleLoginButton = ({
  onSuccess,
  onClick,
  disabled = false,
  text = 'Đăng nhập nhanh bằng Google',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [notice, setNotice] = useState(null);
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleToken = async (tokenResponse) => {
    if (!tokenResponse?.access_token) return;
    setIsLoading(true);
    try {
      await onSuccess?.({ accessToken: tokenResponse.access_token });
    } finally {
      setIsLoading(false);
    }
  };

  const login = useGoogleLogin({
    flow: 'implicit',
    onSuccess: handleToken,
    // Refused on Google's side: the parent can simply try again
    onError: () => setNotice(null),
    // Popup closed by the parent, or blocked by the browser
    onNonOAuthError: (error) => setNotice(error?.type === 'popup_failed_to_open' ? POPUP_BLOCKED_MESSAGE : null),
  });

  // A slow backend (server starting up) is explained, and the loader can never stay forever
  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return undefined;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_SERVER_AFTER_MS);
    const watchdog = setTimeout(() => setIsLoading(false), LOADING_WATCHDOG_MS);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(watchdog);
    };
  }, [isLoading]);

  const handleClick = () => {
    setNotice(null);
    if (!hasClientId) {
      onClick?.();
      return;
    }
    if (!scriptLoadedSuccessfully) {
      setNotice(GOOGLE_UNAVAILABLE_MESSAGE);
      return;
    }
    login();
  };

  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="w-full py-3 px-4 rounded-xl bg-surface-container-low text-on-surface text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-3 border border-hairline shadow-soft cursor-pointer hover:bg-surface-container hover:border-primary-border hover:shadow-md hover:text-primary-dark active:scale-99 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-surface-container-low disabled:hover:border-hairline disabled:hover:shadow-soft disabled:hover:text-on-surface"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{isLoading ? 'Đang xác thực Google...' : text}</span>
      </button>
      {notice && (
        <p role="alert" className="text-label-sm text-error text-center">
          {notice}
        </p>
      )}
      {!notice && isLoading && isSlow && (
        <p role="status" className="text-label-sm text-text-muted text-center">
          {SLOW_SERVER_MESSAGE}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;

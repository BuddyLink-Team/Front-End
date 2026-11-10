import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleLogin, useGoogleOAuth } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

const GOOGLE_UNAVAILABLE_MESSAGE =
  'Không tải được đăng nhập Google. Vui lòng kiểm tra kết nối rồi tải lại trang.';
const GOOGLE_RELOADING_MESSAGE = 'Nút Google đang được tải lại, bạn bấm lại sau giây lát nhé.';
const SLOW_SERVER_MESSAGE = 'Máy chủ đang khởi động, có thể mất đến 1 phút. Bạn chờ một chút nhé.';

// The GSI iframe not drawn after this long: the button is mounted again (a few times at most)
const GSI_RENDER_TIMEOUT_MS = 4000;
const GSI_MAX_AUTO_REMOUNTS = 2;
// The backend still verifying after this long: it is probably starting up (cold start)
const SLOW_SERVER_AFTER_MS = 6000;
// Never stuck on the loader: past the longest auth request (60 s) the button is usable again
const LOADING_WATCHDOG_MS = 75000;

/**
 * Custom-styled Google button. The official GSI button (it returns the ID token the backend verifies)
 * is laid invisibly over it, and only while it can really be clicked:
 * - not before the Google script has loaded (an empty overlay would swallow the clicks)
 * - not while the backend verifies the token (the button shows its loader instead)
 * - not before Google has really drawn its iframe in it: an empty overlay lets the clicks through to the custom
 *   button, which draws the GSI button again (and is drawn again by itself after a few seconds)
 * A slow backend (server starting up) is explained under the button, and the loader never stays forever.
 * After each attempt (success, refusal, closed popup, backend error) the GSI button is mounted again,
 * so the next click always reaches a fresh one.
 * @param {(idToken: string) => Promise<unknown>|void} onSuccess
 * @param {Function} [onClick] - Used without a Google client id (local mock sign-in)
 */
export const GoogleLoginButton = ({
  onSuccess,
  onClick,
  disabled = false,
  text = 'Đăng nhập nhanh bằng Google',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [isUnavailable, setIsUnavailable] = useState(false);
  // The GSI iframe is really drawn inside the overlay: only then may the overlay take the clicks
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const overlayRef = useRef(null);
  const autoRemounts = useRef(0);
  const { scriptLoadedSuccessfully } = useGoogleOAuth();
  const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const isOverlayActive =
    hasClientId && scriptLoadedSuccessfully && !disabled && !isLoading;

  const remountGoogleButton = useCallback(() => setAttempt((count) => count + 1), []);

  // Watch the overlay until Google draws its iframe; an overlay left empty (GSI failed to render after an
  // attempt, slow network) lets the clicks through to the custom button and is mounted again
  useEffect(() => {
    setIsGsiReady(false);
    const node = overlayRef.current;
    if (!isOverlayActive || !node) return undefined;
    const hasIframe = () => Boolean(node.querySelector('iframe'));
    if (hasIframe()) {
      setIsGsiReady(true);
      return undefined;
    }
    const observer = new MutationObserver(() => {
      if (!hasIframe()) return;
      setIsGsiReady(true);
      setIsReloading(false);
      autoRemounts.current = 0;
      observer.disconnect();
    });
    observer.observe(node, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      if (hasIframe() || autoRemounts.current >= GSI_MAX_AUTO_REMOUNTS) return;
      autoRemounts.current += 1;
      remountGoogleButton();
    }, GSI_RENDER_TIMEOUT_MS);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [attempt, isOverlayActive, remountGoogleButton]);

  // A slow backend (server starting up) is explained, and the loader can never stay forever
  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return undefined;
    }
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_SERVER_AFTER_MS);
    const watchdog = setTimeout(() => {
      setIsLoading(false);
      remountGoogleButton();
    }, LOADING_WATCHDOG_MS);
    return () => {
      clearTimeout(slowTimer);
      clearTimeout(watchdog);
    };
  }, [isLoading, remountGoogleButton]);

  const handleCredential = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      remountGoogleButton();
      return;
    }
    setIsLoading(true);
    try {
      await onSuccess?.(credentialResponse.credential);
    } finally {
      setIsLoading(false);
      autoRemounts.current = 0;
      remountGoogleButton();
    }
  };

  // Reached only when no drawn GSI button lies over the custom one
  const handleFallbackClick = () => {
    if (!hasClientId) {
      onClick?.();
      return;
    }
    if (!scriptLoadedSuccessfully) {
      setIsUnavailable(true);
      return;
    }
    // The GSI button is not drawn: draw it again, and offer Google's own account chooser meanwhile
    autoRemounts.current = 0;
    setIsReloading(true);
    remountGoogleButton();
    window.google?.accounts?.id?.prompt?.();
  };

  return (
    <div className="w-full flex flex-col items-center gap-1.5">
      {/* `group` lives here because the invisible GSI overlay sits above the button and swallows its own :hover */}
      <div className="group relative w-full overflow-hidden rounded-xl">
        <button
          type="button"
          onClick={isOverlayActive && isGsiReady ? undefined : handleFallbackClick}
          disabled={disabled || isLoading}
          className="w-full py-3 px-4 rounded-xl bg-surface-container-low text-on-surface text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-3 border border-hairline shadow-soft cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:bg-surface-container group-hover:border-primary-border group-hover:shadow-md group-hover:text-primary-dark group-active:scale-99 group-focus-within:ring-2 group-focus-within:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:group-hover:bg-surface-container-low disabled:group-hover:border-hairline disabled:group-hover:shadow-soft disabled:group-hover:text-on-surface"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
          ) : (
            <svg
              className="w-5 h-5 flex-shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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

        {/*
          Official GSI button, invisible and scaled to cover the custom one. A new `key` after every
          attempt mounts a fresh GSI button. text='signin_with' stays constant so that
          google.accounts.id.initialize() is not triggered again on each render.
        */}
        {isOverlayActive && (
          <div
            key={attempt}
            ref={overlayRef}
            data-testid="google-gsi-overlay"
            data-ready={isGsiReady ? 'true' : 'false'}
            className={`absolute inset-0 opacity-0 overflow-hidden flex items-center justify-center scale-150 ${
              isGsiReady ? 'cursor-pointer' : 'pointer-events-none'
            }`}
          >
            <GoogleLogin
              onSuccess={handleCredential}
              onError={remountGoogleButton}
              text="signin_with"
              shape="rectangular"
              size="large"
              width="400"
            />
          </div>
        )}
      </div>
      {isUnavailable && (
        <p role="alert" className="text-label-sm text-error">
          {GOOGLE_UNAVAILABLE_MESSAGE}
        </p>
      )}
      {!isUnavailable && isLoading && isSlow && (
        <p role="status" className="text-label-sm text-text-muted text-center">
          {SLOW_SERVER_MESSAGE}
        </p>
      )}
      {!isUnavailable && !isLoading && isReloading && !isGsiReady && (
        <p role="status" className="text-label-sm text-text-muted text-center">
          {GOOGLE_RELOADING_MESSAGE}
        </p>
      )}
    </div>
  );
};

export default GoogleLoginButton;

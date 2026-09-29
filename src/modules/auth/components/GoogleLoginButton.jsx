import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

export const GoogleLoginButton = ({
  onSuccess,
  onClick,
  disabled = false,
  text = 'Đăng nhập nhanh bằng Google',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const hasClientId = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <div className="w-full flex justify-center">
      {/* 
        Container wrapping the custom Stitch button with the official GoogleLogin overlaid invisibly.
        This provides 100% pixel-perfect Stitch UI while returning the required JWT ID Token to backend.
      */}
      <div className="relative w-full overflow-hidden rounded-xl">
        {/* Custom Stitch Designed UI Button */}
        <button
          type="button"
          onClick={!hasClientId ? onClick : undefined}
          disabled={disabled || isLoading}
          className="w-full py-3 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-3 border border-hairline shadow-soft active:scale-[0.99] hover:border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
          Official Google GSI iframe rendered with opacity-0 and scaled to cover the button.
          When clicked, Google GSI popup opens and returns credentialResponse.credential (JWT ID token).
          Keep text='signin_with' constant to prevent google.accounts.id.initialize() re-triggers.
        */}
        {hasClientId && !disabled && (
          <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden flex items-center justify-center scale-150">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                setIsLoading(false);
                if (onSuccess && credentialResponse?.credential) {
                  onSuccess(credentialResponse.credential);
                }
              }}
              onError={() => {
                setIsLoading(false);
                console.error('Google Sign-In failed');
              }}
              text="signin_with"
              shape="rectangular"
              size="large"
              width="400"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleLoginButton;

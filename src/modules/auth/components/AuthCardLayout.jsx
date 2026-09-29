import React from 'react';
import AuthVisualPanel from './AuthVisualPanel';

/**
 * Reusable Split-Screen Layout for Authentication & Security Flows
 * (Login, Register, Forgot Password, Reset Password, OTP Verification, etc.)
 *
 * Provides a perfectly stable fixed height on desktop (970px) with the visual hero panel
 * on the left and form/content on the right.
 *
 * @param {React.ReactNode} children - Form inputs and action buttons
 * @param {React.ReactNode} footer - Optional bottom links (e.g. Terms & Privacy, or Support email)
 * @param {string} className - Optional container styling overrides
 */
export const AuthCardLayout = ({ children, footer, className = '' }) => {
  return (
    <div className="w-full flex items-center justify-center py-2 sm:py-6">
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        <div
          className={`w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-hairline lg:h-[1000px] ${className}`}
        >
          {/* LEFT PANEL: Visual Storytelling & Trust Proof */}
          <AuthVisualPanel />

          {/* RIGHT PANEL: Dynamic Form Interface */}
          <div className="w-full lg:w-1/2 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white lg:h-[1000px] overflow-y-auto">
            <div className="space-y-6">{children}</div>

            {/* Optional Bottom Footer */}
            {footer && <div className="pt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCardLayout;

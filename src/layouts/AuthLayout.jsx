import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-surface-low">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-sm">
            B
          </div>
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            Buddy<span className="text-primary">Link</span>
          </span>
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-[0_16px_40px_-8px_rgba(45,55,72,0.06)] border border-hairline rounded-3xl sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

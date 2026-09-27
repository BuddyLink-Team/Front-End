import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-hairline py-6 text-center text-xs text-text-muted bg-white/50">
        &copy; {new Date().getFullYear()} BuddyLink. Nền tảng kết nối bạn chơi an toàn cho trẻ.
      </footer>
    </div>
  );
};

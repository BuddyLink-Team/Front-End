import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import RatingPrompt from '../modules/rating-feedback/components/RatingPrompt';
import AchievementCelebration from '../modules/gamification/components/AchievementCelebration';
import { useAuth } from '../modules/auth/hooks/useAuth';

export const MainLayout = () => {
  const { handleLogout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-primary/20">
      <Navbar onLogout={handleLogout} />
      <main className="flex-1 w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 max-w-[1600px]">
        <Outlet />
      </main>
      <Footer />
      <RatingPrompt />
      <AchievementCelebration />
    </div>
  );
};

export default MainLayout;

import React from 'react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { PageOutlet } from '../components/navigation/PageOutlet';
import PaywallModal from '../modules/subscription/components/PaywallModal';
import RatingPrompt from '../modules/rating-feedback/components/RatingPrompt';
import AchievementCelebration from '../modules/gamification/components/AchievementCelebration';
import AIAssistantFab from '../modules/ai-assistant/components/AIAssistantFab';
import AIAssistantDrawer from '../modules/ai-assistant/components/AIAssistantDrawer';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { useNotificationSocket } from '../modules/notification/hooks/useNotificationSocket';
import { useAccountLockSocket } from '../modules/auth/hooks/useAccountLockSocket';

export const MainLayout = () => {
  const { handleLogout } = useAuth();

  // Attach realtime notification socket listener for parent users
  useNotificationSocket();
  // Sign out right away when an admin locks this account
  useAccountLockSocket();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary selection:bg-primary/20">
      <Navbar onLogout={handleLogout} />
      <main className="flex-1 w-full mx-auto px-6 sm:px-10 lg:px-16 py-6 max-w-shell">
        <PageOutlet />
      </main>
      <Footer />
      <RatingPrompt />
      <AchievementCelebration />
      {/* AI assistant: floating button + slide-out drawer on every parent page */}
      <AIAssistantFab />
      <AIAssistantDrawer />
      {/* Global Paywall Modal */}
      <PaywallModal />
    </div>
  );
};

export default MainLayout;

import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import PlaceholderPage from '../components/feedback/PlaceholderPage';

import DiscoveryPage from '../modules/discovery/pages/DiscoveryPage';
// Pages are code-split: each route downloads its own chunk on first visit
const ChatPage = lazy(() => import('../modules/chat/pages/ChatPage'));
const ParentProfilePage = lazy(() => import('../modules/parent/pages/ParentProfilePage'));
const ChildrenManagementPage = lazy(() => import('../modules/child/pages/ChildrenManagementPage'));
const ChildFormPage = lazy(() => import('../modules/child/pages/ChildFormPage'));
const PlaydateListPage = lazy(() => import('../modules/playdate/pages/PlaydateListPage'));
// Create form and details share one page (/playdates/create and /playdates/:id)
const PlaydateFormPage = lazy(() => import('../modules/playdate/pages/PlaydateFormPage'));
const ConnectionsPage = lazy(() => import('../modules/connection/pages/ConnectionsPage'));
const NotificationPage = lazy(() => import('../modules/notification/pages/NotificationPage'));
const BlockedUsersSettingsPage = lazy(() => import('../modules/safety/pages/BlockedUsersSettingsPage'));

import GamificationPage from '../modules/gamification/pages/GamificationPage';

import SubscriptionPage from '../modules/subscription/pages/SubscriptionPage';
import CheckoutPage from '../modules/subscription/pages/CheckoutPage';
import PaymentSuccessPage from '../modules/subscription/pages/PaymentSuccessPage';
import PaymentCancelPage from '../modules/subscription/pages/PaymentCancelPage';

/**
 * Full route definitions for Parent features.
 */
export const ParentRoutes = () => (
  <Route element={<MainLayout />}>
    {/* Discovery & Peer Matching */}
    <Route
      path="/discovery"
      element={<DiscoveryPage />}
    />

    {/* Playdate Management */}
    <Route
      path="/playdates"
      element={<PlaydateListPage />}
    />
    <Route
      path="/playdates/create"
      element={<PlaydateFormPage />}
    />
    <Route
      path="/playdates/:id"
      element={<PlaydateFormPage />}
    />

    {/* Communication */}
    <Route path="/chat" element={<ChatPage />} />
    <Route path="/chat/playdate/:playdateId" element={<ChatPage />} />
    <Route path="/chat/:conversationId" element={<ChatPage />} />

    {/* AI Assistant */}
    <Route
      path="/ai-assistant"
      element={<PlaceholderPage title="Trợ lý AI BuddyLink" description="Gợi ý địa điểm vui chơi an toàn, trò chơi gắn kết và lập kế hoạch Playdate thông minh." />}
    />

    {/* Child Profiles */}
    <Route
      path="/children"
      element={<ChildrenManagementPage />}
    />
    <Route
      path="/children/create"
      element={<ChildFormPage />}
    />
    <Route
      path="/children/:id/edit"
      element={<ChildFormPage />}
    />

    {/* Parent Account & Profile */}
    <Route path="/profile" element={<ParentProfilePage />} />
    <Route
      path="/profile/edit"
      element={<Navigate to="/profile" replace />}
    />
    <Route
      path="/profile/verification"
      element={<PlaceholderPage title="Xác minh tài khoản" description="Xác minh email và số điện thoại qua OTP để nhận huy hiệu Verified Badge." />}
    />

    {/* Connections */}
    <Route
      path="/connections"
      element={<ConnectionsPage />}
    />

    {/* Notifications */}
    <Route
      path="/notifications"
      element={<NotificationPage />}
    />

    {/* Gamification */}
    <Route
      path="/gamification"
      element={<GamificationPage />}
    />

    {/* Premium Subscription & PayOS Checkout */}
    <Route path="/subscription" element={<SubscriptionPage />} />
    <Route path="/checkout" element={<CheckoutPage />} />
    <Route path="/payment/success" element={<PaymentSuccessPage />} />
    <Route path="/payment/cancel" element={<PaymentCancelPage />} />

    {/* Safety & Settings */}
    <Route path="/blocked-users" element={<BlockedUsersSettingsPage />} />
    <Route path="/safety" element={<Navigate to="/blocked-users" replace />} />
  </Route>
);

export default ParentRoutes;
